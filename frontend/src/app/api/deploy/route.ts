import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { spawn } from 'child_process'
import { mkdtemp, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login with GitHub' },
        { status: 401 }
      )
    }

    const { repo, name, template, network = 'testnet' } = await request.json()

    if (!repo) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      )
    }

    // Get user's Stellar keypair
    const githubId = session.user.id || ''
    const user = await prisma.user.findUnique({
      where: { githubId },
      include: { stellarKeypairs: true }
    })

    if (!user || user.stellarKeypairs.length === 0) {
      return NextResponse.json(
        { error: 'No Stellar keypair found. Please generate a keypair first.' },
        { status: 400 }
      )
    }

    const keypair = user.stellarKeypairs[0]
    const account = network === 'testnet' ? keypair.testnetPublicKey : keypair.mainnetPublicKey
    const secretKey = network === 'testnet' ? keypair.testnetSecretKey : keypair.mainnetSecretKey

    if (!account || !secretKey) {
      return NextResponse.json(
        { error: `No ${network} keypair found. Please generate a ${network} keypair first.` },
        { status: 400 }
      )
    }

    // SSE streaming response
    const stream = new ReadableStream({
      start(controller) {
        deployContract(controller, repo, account, secretKey, network, name || 'contract')
          .catch(error => {
            controller.enqueue(`data: ${JSON.stringify({
              type: 'error',
              message: `Deployment failed: ${error.message}`
            })}\n\n`)
            controller.close()
          })
      }
    })

    // Retorne o SSE imediatamente
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      }
    })
  } catch (error) {
    console.error('Error starting deployment:', error)
    return NextResponse.json(
      { error: 'Failed to start deployment' },
      { status: 500 }
    )
  }
}

async function deployContract(
  controller: ReadableStreamDefaultController,
  repoUrl: string,
  account: string,
  secretKey: string,
  network: string,
  contractName: string
) {
  let tempDir: string | null = null
  let isControllerClosed = false

  const sendLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    if (isControllerClosed) {
      console.log(`[${type}] ${message}`) // Log to console if controller is closed
      return
    }

    try {
      controller.enqueue(`data: ${JSON.stringify({
        type,
        message,
        timestamp: new Date().toISOString()
      })}\n\n`)
    } catch (error) {
      isControllerClosed = true
      console.log(`[${type}] ${message}`) // Fallback to console
    }
  }

  try {
    // Create temporary directory for the deployment
    tempDir = await mkdtemp(join(tmpdir(), 'stellar-deploy-'))
    sendLog(`📁 Created temporary workspace: ${tempDir}`)

    sendLog('🚀 Initializing Docker deployment...')
    sendLog(`📁 Repository: ${repoUrl}`)
    sendLog(`👤 Account: ${account}`)
    sendLog(`🌐 Network: ${network}`)

    // Run the stellar-deployer Docker container with volume mount
    const dockerArgs = [
      'run',
      '--rm',
      //'-v', `${tempDir}:/workspace`,
      'stellar-deployer:latest',
      repoUrl,
      secretKey,
      network
    ]

    const dockerCommand = `docker ${dockerArgs.join(' ')}`
    sendLog('🐳 Docker command details:')
    sendLog(`Volume mount: ${tempDir}:/workspace`)
    sendLog(`Command: ${dockerCommand}`)
    sendLog('🚀 Starting Docker container...')

    const dockerProcess = spawn('docker', dockerArgs, {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let processCompleted = false

    // Handle stdout (deployment logs)
    dockerProcess.stdout.on('data', (data) => {
      const output = data.toString().trim()
      if (output) {
        const lines = output.split('\n')
        lines.forEach(line => {
          if (line.trim()) {
            // Classify stdout output as well
            const lowerLine = line.toLowerCase()

            if (lowerLine.includes('✅') || lowerLine.includes('success') || lowerLine.includes('completed')) {
              sendLog(line.trim(), 'success')
            } else if (lowerLine.includes('❌') || lowerLine.includes('error')) {
              sendLog(line.trim(), 'info') // Use 'info' to avoid premature termination
            } else {
              sendLog(`📝 ${line.trim()}`, 'info')
            }
          }
        })
      }
    })

    dockerProcess.stderr.on('data', (data) => {
      const output = data.toString().trim()
      if (output) {
        const lines = output.split('\n')
        lines.forEach(line => {
          if (line.trim()) {
            const lowerLine = line.toLowerCase()

            // True errors
            if (lowerLine.includes('error:') ||
                lowerLine.includes('failed') ||
                lowerLine.includes('panic') ||
                lowerLine.includes('no sign with key') ||
                lowerLine.includes('fatal:')) {
              sendLog(`❌ ${line.trim()}`, 'info')
            }
            // Success indicators
            else if (lowerLine.includes('finished') && lowerLine.includes('release') ||
                     lowerLine.includes('successfully') ||
                     lowerLine.includes('complete')) {
              sendLog(`✅ ${line.trim()}`, 'success')
            }
            // Info/warnings (most stderr output)
            else {
              sendLog(`ℹ️ ${line.trim()}`, 'info')
            }
          }
        })
      }
    })

    // Handle process completion
    dockerProcess.on('close', async (code) => {
      if (processCompleted) return
      processCompleted = true

      // Cleanup temporary directory
      if (tempDir) {
        try {
          await rm(tempDir, { recursive: true, force: true })
          sendLog(`🧹 Cleaned up temporary workspace`)
        } catch (err) {
          sendLog(`⚠️ Failed to cleanup temp dir: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      if (code === 0) {
        sendLog('🎉 Deployment completed successfully!', 'success')
        if (!isControllerClosed) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'complete',
            network,
            message: 'Deployment completed successfully!'
          })}\n\n`)
        }
      } else {
        sendLog(`❌ Deployment failed with exit code: ${code}`, 'error')
        if (!isControllerClosed) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            message: `Docker process exited with code ${code}`
          })}\n\n`)
        }
      }

      if (!isControllerClosed) {
        isControllerClosed = true
        controller.close()
      }
    })

    // Handle process errors
    dockerProcess.on('error', async (error) => {
      if (processCompleted) return
      processCompleted = true

      // Cleanup temporary directory
      if (tempDir) {
        try {
          await rm(tempDir, { recursive: true, force: true })
          sendLog(`🧹 Cleaned up temporary workspace`)
        } catch (err) {
          console.error('Failed to cleanup temp dir:', err)
        }
      }

      sendLog(`❌ Docker process error: ${error.message}`, 'error')
      if (!isControllerClosed) {
        controller.enqueue(`data: ${JSON.stringify({
          type: 'error',
          message: `Docker error: ${error.message}`
        })}\n\n`)
      }

      if (!isControllerClosed) {
        isControllerClosed = true
        controller.close()
      }
    })

  } catch (error) {
    sendLog(`❌ Failed to start deployment: ${error instanceof Error ? error.message : String(error)}`, 'error')
    if (!isControllerClosed) {
      controller.enqueue(`data: ${JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : String(error)
      })}\n\n`)
    }
  }
}

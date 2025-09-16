import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { execSync } from 'child_process'
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

    // Create a readable stream for deployment logs
    const stream = new ReadableStream({
      start(controller) {
        // Start deployment process
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

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
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

  const sendLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    controller.enqueue(`data: ${JSON.stringify({
      type,
      message,
      timestamp: new Date().toISOString()
    })}\n\n`)
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
      '-v', `${tempDir}:/workspace`,
      '-e', `STELLAR_SECRET_KEY=${secretKey}`,
      'stellar-deployer:latest',
      repoUrl,
      account,
      network
    ]

    const dockerCommand = `docker ${dockerArgs.join(' ')}`
    sendLog('🐳 Docker command details:')
    sendLog(`Volume mount: ${tempDir}:/workspace`)
    sendLog(`Command: ${dockerCommand}`)
    sendLog('🚀 Starting Docker container...')

    try {
      // Execute Docker command synchronously and capture output
      const output = execSync(dockerCommand, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 300000, // 5 minutes timeout
        env: {
          ...process.env,
          STELLAR_SECRET_KEY: secretKey
        }
      })

      // Process the output line by line
      const lines = output.split('\n')
      lines.forEach(line => {
        if (line.trim()) {
          sendLog(line.trim())
        }
      })

      sendLog('🎉 Deployment completed successfully!', 'success')
      controller.enqueue(`data: ${JSON.stringify({
        type: 'complete',
        network,
        message: 'Deployment completed successfully!'
      })}\n\n`)

    } catch (error: any) {
      // Handle execution errors
      if (error.stdout) {
        const lines = error.stdout.split('\n')
        lines.forEach((line: string) => {
          if (line.trim()) {
            sendLog(line.trim())
          }
        })
      }

      if (error.stderr) {
        const lines = error.stderr.split('\n')
        lines.forEach((line: string) => {
          if (line.trim()) {
            sendLog(`⚠️ ${line.trim()}`, 'error')
          }
        })
      }

      sendLog(`❌ Deployment failed: ${error.message}`, 'error')
      controller.enqueue(`data: ${JSON.stringify({
        type: 'error',
        message: `Docker process failed: ${error.message}`
      })}\n\n`)
    }

  } catch (error) {
    sendLog(`❌ Failed to start deployment: ${error instanceof Error ? error.message : String(error)}`, 'error')
    controller.enqueue(`data: ${JSON.stringify({
      type: 'error',
      message: error instanceof Error ? error.message : String(error)
    })}\n\n`)
  } finally {
    // Cleanup temporary directory
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true })
        sendLog(`🧹 Cleaned up temporary workspace`)
      } catch (err) {
        sendLog(`⚠️ Failed to cleanup temp dir: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    controller.close()
  }
}

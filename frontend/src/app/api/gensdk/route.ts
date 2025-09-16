import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { spawn } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    const { contractId, network = 'testnet' } = await request.json()

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      )
    }

    // Force testnet for now, can be expanded later
    if (network !== 'testnet') {
      return NextResponse.json(
        { error: 'Only testnet is currently supported' },
        { status: 400 }
      )
    }

    // SSE streaming response
    const stream = new ReadableStream({
      start(controller) {
        generateSdk(controller, contractId, network)
          .catch(error => {
            controller.enqueue(`data: ${JSON.stringify({
              type: 'error',
              message: `SDK Generation failed: ${error.message}`
            })}\n\n`)
            controller.close()
          })
      }
    })

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  } catch (error) {
    console.error('Error starting SDK generation:', error)
    return NextResponse.json(
      { error: 'Failed to start SDK generation' },
      { status: 500 }
    )
  }
}

async function generateSdk(
  controller: ReadableStreamDefaultController,
  contractId: string,
  network: string,
) {
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
    sendLog('🚀 Initializing SDK Generation...')
    sendLog(`📄 Contract ID: ${contractId}`)
    sendLog(`🌐 Network: ${network}`)

    const dockerArgs = [
      'run',
      '--rm',
      'gensdk', // The image name we chose
      network,
      contractId
    ]

    const dockerCommand = `docker ${dockerArgs.join(' ')}`
    sendLog(`🐳 Docker command: ${dockerCommand}`)
    sendLog('🚀 Starting Docker container...')

    const dockerProcess = spawn('docker', dockerArgs, {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let processCompleted = false
    let sdkBase64 = ''
    let errorLogs = ''

    // The gensdk script writes logs to stderr and the final base64 to stdout
    dockerProcess.stdout.on('data', (data) => {
      sdkBase64 += data.toString()
    })

    dockerProcess.stderr.on('data', (data) => {
      const output = data.toString().trim()
      errorLogs += output + '\n'
      if (output) {
        const lines = output.split('\n')
        lines.forEach((line: string) => {
          if (line.trim()) {
            // Just forward the logs from the script
            sendLog(`ℹ️ ${line.trim()}`, 'info')
          }
        })
      }
    })

    dockerProcess.on('close', async (code) => {
      if (processCompleted) return
      processCompleted = true

      if (code === 0) {
        sendLog('🎉 SDK generated successfully!', 'success')

        if (!isControllerClosed) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'complete',
            sdkBase64: sdkBase64.trim(),
            message: 'SDK Generation completed successfully!'
          })}\n\n`)
        }
      } else {
        sendLog(`❌ SDK Generation failed with exit code: ${code}`, 'error')
        if (!isControllerClosed) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            message: `Docker process exited with code ${code}. Logs: ${errorLogs}`
          })}\n\n`)
        }
      }

      if (!isControllerClosed) {
        isControllerClosed = true
        controller.close()
      }
    })

    dockerProcess.on('error', async (error) => {
      if (processCompleted) return
      processCompleted = true

      sendLog(`❌ Docker process error: ${error.message}`, 'error')
      if (!isControllerClosed) {
        controller.enqueue(`data: ${JSON.stringify({
          type: 'error',
          message: `Docker error: ${error.message}`
        })}\n\n`)
        isControllerClosed = true
        controller.close()
      }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    sendLog(`❌ Failed to start SDK generation: ${errorMessage}`, 'error')
    if (!isControllerClosed) {
      controller.enqueue(`data: ${JSON.stringify({
        type: 'error',
        message: errorMessage
      })}\n\n`)
    }
  }
}

"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function DeployPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')
  const [logs, setLogs] = useState<string[]>([])

  const repo = searchParams.get('repo')
  const name = searchParams.get('name')
  const template = searchParams.get('template')

  const isTemplate = !!template
  const projectName = name || 'Unknown Project'

  useEffect(() => {
    if (!session) {
      return
    }
  }, [session])

  const handleDeploy = async () => {
    setDeployStatus('deploying')
    setLogs([])

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo,
          name: projectName,
          template: isTemplate,
          network: 'testnet' // Default to testnet for now
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start deployment')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ') && line.trim() !== 'data: ') {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'error') {
                setLogs(prev => [...prev, `❌ ${data.message}`])
                setDeployStatus('error')
                reader.releaseLock()
                return
              } else if (data.type === 'complete') {
                setLogs(prev => [...prev, `🎉 ${data.message}`])
                if (data.contractId) {
                  setLogs(prev => [...prev, `📄 Contract ID: ${data.contractId}`])
                }
                setDeployStatus('success')
                reader.releaseLock()
                return
              } else {
                setLogs(prev => [...prev, data.message])
              }
            } catch (e) {
              console.warn('Failed to parse JSON:', line)
              // Skip invalid JSON lines
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.startsWith('data: ') && buffer.trim() !== 'data: ') {
        try {
          const data = JSON.parse(buffer.slice(6))
          if (data.message) {
            setLogs(prev => [...prev, data.message])
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }

      reader.releaseLock()

    } catch (error) {
      console.error('Deployment error:', error)
      setLogs(prev => [...prev, `❌ ${error instanceof Error ? error.message : 'Unknown error'}`])
      setDeployStatus('error')
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-400 mb-8">
              Please log in to deploy smart contracts.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <header className="border-b border-gray-700/50 backdrop-blur-sm bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/30"
                title="Back to Home"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-white">
                Deploy Smart Contract
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/30"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center py-8 mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Deploy to Stellar Network
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            {isTemplate ? 'Template' : 'Repository'}: {projectName}
          </p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="text-sm text-green-300 font-medium">Repository Selected</span>
            </div>
            <div className="w-12 h-px bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm text-purple-300 font-medium">Deploy Contract</span>
            </div>
            <div className="w-12 h-px bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-600 text-gray-400 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-sm text-gray-400 font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Project Info Card */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                {projectName}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  {isTemplate ? (
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isTemplate ? 'Template' : 'Repository'}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  Rust/Soroban
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Testnet
                </span>
              </div>
              {repo && (
                <a
                  href={repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 hover:underline text-sm flex items-center gap-1"
                >
                  View Source
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
            <div className="ml-6">
              {deployStatus === 'idle' && (
                <button
                  onClick={handleDeploy}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Start Deployment
                </button>
              )}
              {deployStatus === 'deploying' && (
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                  Deploying...
                </div>
              )}
              {deployStatus === 'error' && (
                <button
                  onClick={handleDeploy}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Deployment
                </button>
              )}
              {deployStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Deployed Successfully
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {deployStatus === 'error' && (
          <div className="mt-6 bg-red-900/20 border border-red-800/50 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-400">
                  Deployment Failed
                </h3>
                <p className="text-sm text-red-300 mt-1">
                  Check the logs above for details. You can retry the deployment or contact support if the issue persists.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setDeployStatus('idle')
                      setLogs([])
                    }}
                    className="text-sm text-red-400 hover:text-red-300 font-medium"
                  >
                    Reset and Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deployment Logs */}
        {logs.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Deployment Logs</h3>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded p-3 font-mono text-sm max-h-64 overflow-y-auto border border-gray-800/50">
              {logs.map((log, index) => {
                const isError = log.includes('❌')
                const isSuccess = log.includes('✅') || log.includes('🎉')
                const colorClass = isError ? 'text-red-400' : isSuccess ? 'text-green-400' : 'text-blue-400'

                return (
                  <div key={index} className={`${colorClass} mb-1`}>
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                )
              })}
              {deployStatus === 'deploying' && (
                <div className="text-blue-400 mb-1 flex items-center gap-2">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {deployStatus === 'success' && (
          <div className="mt-6 bg-green-900/20 border border-green-800/50 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-400">
                  Deployment Successful!
                </h3>
                <p className="text-sm text-green-300 mt-1">
                  Your smart contract has been successfully deployed to the Stellar network.
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => {
                      setDeployStatus('idle')
                      setLogs([])
                    }}
                    className="text-sm text-green-400 hover:text-green-300 font-medium"
                  >
                    Deploy Another Contract
                  </button>
                  <Link
                    href="/"
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                  >
                    View Projects
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

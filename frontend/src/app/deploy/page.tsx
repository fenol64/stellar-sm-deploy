"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

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

    // Simulate deployment process with logs
    const deploymentSteps = [
      'Initializing deployment...',
      `Cloning ${isTemplate ? 'template' : 'repository'}: ${projectName}`,
      'Installing dependencies...',
      'Building Rust project...',
      'Compiling WASM contract...',
      'Connecting to Stellar network...',
      'Deploying smart contract...',
      'Verifying deployment...',
      'Deployment completed successfully!'
    ]

    for (let i = 0; i < deploymentSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
      setLogs(prev => [...prev, deploymentSteps[i]])

      // Simulate occasional error (10% chance)
      if (Math.random() < 0.1 && i === 6) {
        setLogs(prev => [...prev, 'Error: Network timeout. Retrying...'])
        await new Promise(resolve => setTimeout(resolve, 2000))
        setLogs(prev => [...prev, 'Retry successful. Continuing deployment...'])
      }
    }

    setDeployStatus('success')
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to deploy smart contracts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <a href="/" className="hover:text-gray-700 dark:hover:text-gray-300">Home</a>
            <span>/</span>
            <span>Deploy</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Deploy Smart Contract
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isTemplate ? 'Template' : 'Repository'}: {projectName}
          </p>
        </div>

        {/* Project Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {projectName}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  {isTemplate ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isTemplate ? 'Template' : 'Repository'}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  Rust/Soroban
                </span>
              </div>
              {repo && (
                <a
                  href={repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View Source →
                </a>
              )}
            </div>
            <div className="ml-6">
              {deployStatus === 'idle' && (
                <button
                  onClick={handleDeploy}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Start Deployment
                </button>
              )}
              {deployStatus === 'deploying' && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  Deploying...
                </div>
              )}
              {deployStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Deployed Successfully
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deployment Logs */}
        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Deployment Logs</h3>
            </div>
            <div className="bg-black rounded p-3 font-mono text-sm max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-green-400 mb-1">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
              {deployStatus === 'deploying' && (
                <div className="text-green-400 mb-1 flex items-center gap-2">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {deployStatus === 'success' && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                  Deployment Successful!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your smart contract has been successfully deployed to the Stellar network.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setDeployStatus('idle')
                      setLogs([])
                    }}
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
                  >
                    Deploy Another Contract
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

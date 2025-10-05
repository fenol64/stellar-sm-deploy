"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface RecentDeployment {
  id: string
  status: string
  network: string
  contractAddress: string | null
  createdAt: string
  repository: {
    id: string
    name: string
    description: string | null
    htmlUrl: string
  }
  lastCommit?: {
    sha: string
    message: string
    author: string
    url: string
  }
}

export default function RecentDeploymentsList() {
  const { data: session } = useSession()
  const [deployments, setDeployments] = useState<RecentDeployment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      loadRecentDeployments()
    }
  }, [session])

  const loadRecentDeployments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/deployments/recent')

      if (!response.ok) {
        throw new Error('Failed to load recent deployments')
      }

      const data = await response.json()
      setDeployments(data.deployments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      case 'failed':
      case 'error':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      case 'deploying':
      case 'pending':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'text-green-600'
      case 'failed':
      case 'error':
        return 'text-red-600'
      case 'deploying':
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-slate-500'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-red-200 p-6 shadow-sm">
        <div className="text-center text-red-700">
          <p>Error loading deployments: {error}</p>
          <button
            onClick={loadRecentDeployments}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Recent Deployments</h2>
        <Link
          href="/add"
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          Deploy New →
        </Link>
      </div>

      {deployments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No deployments yet</h3>
          <p className="text-slate-600 mb-4">Deploy your first smart contract</p>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Deploy Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map((deployment) => (
            <Link
              key={deployment.id}
              href={`/repositories/${deployment.repository.id}`}
              className="block bg-white/60 hover:bg-white/80 border border-slate-200 hover:border-slate-300 rounded-lg p-4 transition-all duration-200 group shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(deployment.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                        {deployment.repository.name}
                      </h3>
                      <span className={`text-xs ${getStatusColor(deployment.status)} capitalize`}>
                        {deployment.status}
                      </span>
                      <span className="text-xs text-slate-600 capitalize">
                        {deployment.network}
                      </span>
                    </div>

                    {deployment.lastCommit && (
                      <div className="mb-2">
                        <div className="text-xs mb-1">
                          <span className="text-slate-600">Author:</span>
                          <span className="ml-1 text-slate-900">{deployment.lastCommit.author}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-600">SHA:</span>
                            <a
                              href={deployment.lastCommit.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 font-mono text-blue-600 hover:text-blue-800 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {deployment.lastCommit.sha.substring(0, 7)}
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-600">Message:</span>
                            <span className="ml-1 text-slate-900 truncate">
                              {deployment.lastCommit.message}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {deployment.contractAddress && (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-green-700 font-mono">
                          {deployment.contractAddress.slice(0, 16)}...
                        </code>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            navigator.clipboard.writeText(deployment.contractAddress!)
                          }}
                          className="hover:text-slate-900 transition-colors text-slate-500"
                          title="Copy contract address"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    {formatTimeAgo(deployment.createdAt)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

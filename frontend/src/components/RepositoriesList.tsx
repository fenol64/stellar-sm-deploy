"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Repository {
  id: string
  name: string
  description: string | null
  htmlUrl: string
  private: boolean
  createdAt: string
  deployments: Array<{
    id: string
    status: string
    network: string
    createdAt: string
    contractAddress: string | null
  }>
}

export default function RepositoriesList() {
  const { data: session } = useSession()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      loadRepositories()
    }
  }, [session])

  const loadRepositories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/repositories')

      if (!response.ok) {
        throw new Error('Failed to load repositories')
      }

      const data = await response.json()
      setRepositories(data.repositories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getLatestDeploymentStatus = (deployments: Repository['deployments']) => {
    if (deployments.length === 0) return 'none'
    return deployments[0].status
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
      case 'none':
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="text-center text-red-400">
          <p>Error loading repositories: {error}</p>
          <button
            onClick={loadRepositories}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">My Repositories</h2>
        <Link
          href="/repositories"
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All →
        </Link>
      </div>

      {repositories.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No repositories yet</h3>
          <p className="text-gray-400 mb-4">Import a GitHub repository to get started</p>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Import Repository
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {repositories.slice(0, 5).map((repo) => (
            <Link
              key={repo.id}
              href={`/repositories/${repo.id}`}
              className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                      {repo.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate max-w-md">
                      {repo.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(getLatestDeploymentStatus(repo.deployments))}
                    <span className="text-xs text-gray-400">
                      {repo.deployments.length} deployment{repo.deployments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {repo.private ? 'Private' : 'Public'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(repo.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {repositories.length > 5 && (
            <div className="text-center pt-4">
              <Link
                href="/repositories"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                View {repositories.length - 5} more repositories →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

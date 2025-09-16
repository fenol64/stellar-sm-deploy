"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Deployment {
  id: string
  contractAddress: string | null
  network: string
  status: string
  createdAt: string
  deployedAt: string | null
}

interface Repository {
  id: string
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  cloneUrl: string
  language: string | null
  private: boolean
  stargazers: number
  createdAt: string
  updatedAt: string
  latestDeployment: Deployment | null
  deploymentCount: number
}

export default function RepositoriesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    fetchRepositories()
  }, [session])

  const fetchRepositories = async () => {
    try {
      const response = await fetch('/api/repositories')
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }
      const data = await response.json()
      setRepositories(data)
    } catch (error) {
      console.error('Failed to fetch repositories:', error)
      setError('Failed to load repositories')
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = (repo: Repository) => {
    router.push(`/deploy?repo=${encodeURIComponent(repo.cloneUrl)}&name=${encodeURIComponent(repo.name)}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DEPLOYED': return 'text-green-400 bg-green-400/10'
      case 'DEPLOY_FAILED': return 'text-red-400 bg-red-400/10'
      case 'BUILDING': return 'text-yellow-400 bg-yellow-400/10'
      case 'PENDING': return 'text-blue-400 bg-blue-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-white border-r-white"></div>
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
                My Repositories
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/add"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Repository
              </Link>
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
        {/* Header */}
        <div className="text-center py-8 mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Your Smart Contract Repositories
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Manage and deploy your Stellar smart contracts from your imported repositories.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {repositories.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-2xl font-semibold text-white mb-4">No repositories yet</h3>
            <p className="text-gray-400 mb-6">
              Import your first repository to start deploying smart contracts.
            </p>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Import Repository
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <div key={repo.id} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:border-gray-600/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/repositories/${repo.id}`}
                      className="text-xl font-semibold text-white hover:text-purple-400 transition-colors"
                    >
                      {repo.name}
                    </Link>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {repo.description || 'No description available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    {repo.language || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    {repo.stargazers}
                  </span>
                  <span>
                    {repo.deploymentCount} deployment{repo.deploymentCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {repo.latestDeployment && (
                  <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repo.latestDeployment.status)}`}>
                        Latest: {repo.latestDeployment.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(repo.latestDeployment.deployedAt || repo.latestDeployment.createdAt)}
                      </span>
                    </div>
                    {repo.latestDeployment.contractAddress && (
                      <code className="text-xs text-green-400 font-mono mt-2 block truncate">
                        {repo.latestDeployment.contractAddress}
                      </code>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/repositories/${repo.id}`}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm text-center transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDeploy(repo)}
                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                  >
                    Deploy
                  </button>
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    title="View on GitHub"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

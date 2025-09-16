"use client"

import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Deployment {
  id: string
  contractAddress: string | null
  network: string
  status: string
  createdAt: string
  deployedAt: string | null
  stellarKeypair: {
    testnetPublicKey: string
  }
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
  deployments: Deployment[]
  deploymentCount: number
}

export default function RepositoryPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const repositoryId = params.id as string

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    if (repositoryId) {
      fetchRepository()
    }
  }, [session, repositoryId])

  const fetchRepository = async () => {
    try {
      const response = await fetch(`/api/repositories/${repositoryId}`)
      if (!response.ok) {
        throw new Error('Repository not found')
      }
      const data = await response.json()
      setRepository(data)
    } catch (error) {
      console.error('Failed to fetch repository:', error)
      setError('Failed to load repository')
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = () => {
    if (repository) {
      router.push(`/deploy?repo=${encodeURIComponent(repository.cloneUrl)}&name=${encodeURIComponent(repository.name)}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DEPLOYED': return 'text-success-700 bg-success-100'
      case 'DEPLOY_FAILED': return 'text-error-700 bg-error-100'
      case 'BUILDING': return 'text-warning-700 bg-warning-100'
      case 'PENDING': return 'text-navy-700 bg-navy-100'
      default: return 'text-slate-700 bg-slate-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-blue-600 border-r-blue-600"></div>
      </div>
    )
  }

  if (error || !repository) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Repository Not Found
            </h1>
            <p className="text-slate-600 mb-8">
              The repository you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
      <header className="border-b border-blue-200/60 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100/50"
                title="Back to Home"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <img
                src="/stellar.svg"
                alt="Stellar"
                className="h-6 w-auto text-slate-900"
              />
              <h1 className="text-xl font-bold text-slate-900">
                Repository Details
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100/50"
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
        {/* Repository Info */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {repository.name}
              </h2>
              <p className="text-slate-600 mb-4">
                {repository.description || 'No description available'}
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  {repository.language || 'Unknown'}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  {repository.stargazers} stars
                </span>
                <span>
                  {repository.deploymentCount} deployment{repository.deploymentCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={repository.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                View Source
              </a>
              <button
                onClick={handleDeploy}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Deploy
              </button>
            </div>
          </div>
        </div>

        {/* Deployments History */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Deployment History</h3>

          {repository.deployments.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-slate-600 mb-4">No deployments yet</p>
              <button
                onClick={handleDeploy}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Deploy First Contract
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {repository.deployments.map((deployment) => (
                <div key={deployment.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                          {deployment.status}
                        </span>
                        <span className="text-sm text-slate-500">
                          {formatDate(deployment.deployedAt || deployment.createdAt)}
                        </span>
                      </div>

                      {deployment.contractAddress && (
                        <div className="mb-2">
                          <label className="text-sm text-slate-600">Contract Address:</label>
                          <code className="block text-sm text-success-700 font-mono bg-white p-2 rounded mt-1 border border-slate-200">
                            {deployment.contractAddress}
                          </code>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-slate-600">Network:</label>
                          <p className="text-slate-900 capitalize">{deployment.network}</p>
                        </div>
                        <div>
                          <label className="text-slate-600">Account:</label>
                          <p className="text-slate-900 font-mono text-xs">{deployment.stellarKeypair.testnetPublicKey}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/deploy/success?id=${deployment.id}`}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

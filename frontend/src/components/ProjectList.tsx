"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string
  repositoryUrl: string
  network: string
  status: string
  contractId?: string
  createdAt: string
  updatedAt: string
  type: 'template' | 'repository'
}

function ProjectList() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      loadProjects()
    }
  }, [session])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')

      if (!response.ok) {
        throw new Error('Failed to load projects')
      }

      const data = await response.json()
      setProjects(data.projects || [])
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
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        )
      case 'failed':
      case 'error':
        return (
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        )
      case 'deploying':
      case 'pending':
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        )
      default:
        return (
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        )
    }
  }

  const getTypeIcon = (type: string) => {
    if (type === 'template') {
      return (
        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    )
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
          <p>Error loading projects: {error}</p>
          <button
            onClick={loadProjects}
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
        <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
        <Link
          href="/add"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
          <p className="text-gray-400 mb-4">Deploy your first smart contract to get started</p>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Deploy Project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(project.type)}
                  <div>
                    <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate max-w-md">
                      {project.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(project.status)}
                    <span className="text-xs text-gray-400 capitalize">
                      {project.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {project.network}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(project.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {project.contractId && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Contract ID:</span>
                    <code className="bg-white/10 px-2 py-1 rounded text-green-400 font-mono">
                      {project.contractId.slice(0, 20)}...
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(project.contractId!)}
                      className="hover:text-white transition-colors"
                      title="Copy contract ID"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectList

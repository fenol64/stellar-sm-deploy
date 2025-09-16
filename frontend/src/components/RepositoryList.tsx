"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  updated_at: string
  private: boolean
}

export default function RepositoryList() {
  const { data: session } = useSession()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    console.log(session)
    if (session?.accessToken) {
      fetchRepositories()
    }
  }, [session])

  const fetchRepositories = async () => {
    try {
      setLoading(true)

      // First get user info to get the username
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${session?.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info')
      }

      const userInfo = await userResponse.json()

      // Then search for Rust repositories from this user
      const response = await fetch(`https://api.github.com/search/repositories?q=user:${userInfo.login}+language:rust&sort=updated&per_page=50`, {
        headers: {
          'Authorization': `token ${session?.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const data = await response.json()
      // GitHub search API returns results in 'items' array
      setRepositories(data.items || [])
    } catch (err) {
      setError('Failed to load Rust repositories')
      console.error('Error fetching repositories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = (repoUrl: string, repoName: string) => {
    router.push(`/deploy?repo=${encodeURIComponent(repoUrl)}&name=${encodeURIComponent(repoName)}`)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="bg-black/5 dark:bg-black/20 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div>
                  <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
              <div className="w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-black/5 dark:bg-black/20 rounded-2xl border border-red-200/50 dark:border-red-700/50 p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{error}</h3>
          <button
            onClick={fetchRepositories}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 h-fit">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-2">
          Import Git Repository
        </h3>
        <p className="text-sm text-gray-400">
          {repositories.length} repositories
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 transition-all duration-200"
        />
        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Repository Cards */}
      <div className="space-y-3 mb-6">
        {filteredRepositories.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-white mb-1">
              No Rust repositories found
            </h4>
            <p className="text-xs text-gray-400">
              {searchTerm ? "Try adjusting your search" : "Create a Rust project to get started"}
            </p>
          </div>
        ) : (
          filteredRepositories.map((repo) => (
            <div
              key={repo.id}
              className="group bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-lg p-4 hover:bg-gray-800/40 hover:border-gray-600/50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors text-sm truncate">
                        {repo.name}
                      </h4>
                      {repo.private && (
                        <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Rust • {getTimeAgo(repo.updated_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeploy(repo.html_url, repo.name)}
                  className="bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white backdrop-blur-sm transition-all duration-200 font-medium text-sm h-8 px-3 rounded-md flex-shrink-0"
                >
                  Import
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Import Third-Party Repository */}
    </div>
  )
}

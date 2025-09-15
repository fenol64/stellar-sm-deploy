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
  const router = useRouter()

  useEffect(() => {
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
    // Navigate to deploy page with repository URL as parameter
    router.push(`/deploy?repo=${encodeURIComponent(repoUrl)}&name=${encodeURIComponent(repoName)}`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800 dark:text-red-400">{error}</span>
        </div>
        <button
          onClick={fetchRepositories}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {repositories.length} Rust repositories found
          </span>
        </div>
        <button
          onClick={fetchRepositories}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {repositories.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">
            No Rust repositories found
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Create a Rust project or use our templates to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {repositories.map((repo) => (
            <div key={repo.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-orange-200 dark:border-orange-800 ring-1 ring-orange-100 dark:ring-orange-900 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate pr-2">
                    {repo.name}
                  </h4>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1"></div>
                    Rust
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {repo.private && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      Private
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {repo.description || "No description available"}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {repo.stargazers_count}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View
                </a>
                <button
                  onClick={() => handleDeploy(repo.html_url, repo.name)}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

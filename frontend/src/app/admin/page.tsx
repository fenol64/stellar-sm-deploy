'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface AdminKeypair {
  publicKey: string
  githubUsername: string
  createdAt: string
}

interface DatabaseStats {
  statistics: {
    totalUsers: number
    totalKeypairs: number
    totalRepositories: number
    totalDeployments: number
  }
  recentActivity: AdminKeypair[]
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [keypairs, setKeypairs] = useState<AdminKeypair[]>([])
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      loadKeypairs()
      loadStats()
    }
  }, [session])

  const loadKeypairs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/keypairs')

      if (!response.ok) {
        throw new Error('Failed to load keypairs')
      }

      const data = await response.json()
      setKeypairs(data)
    } catch (err) {
      setError('Failed to load keypairs')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')

      if (!response.ok) {
        throw new Error('Failed to load stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-slate-900 text-xl">Please login to access admin panel</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Admin Panel</h1>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.statistics.totalUsers}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Stellar Keypairs</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.statistics.totalKeypairs}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Repositories</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.statistics.totalRepositories}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Deployments</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.statistics.totalDeployments}</p>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Stellar Keypairs</h2>

          {loading && (
            <div className="text-slate-900">Loading keypairs...</div>
          )}

          {error && (
            <div className="text-error-700 mb-4">{error}</div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-slate-900">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2">GitHub Username</th>
                    <th className="text-left py-2">Public Key</th>
                    <th className="text-left py-2">Created At</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keypairs.map((keypair) => (
                    <tr key={keypair.publicKey} className="border-b border-slate-100">
                      <td className="py-4">{keypair.githubUsername}</td>
                      <td className="py-4 font-mono text-sm">
                        {keypair.publicKey.substring(0, 20)}...
                      </td>
                      <td className="py-4">
                        {new Date(keypair.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <a
                          href={`https://friendbot.stellar.org?addr=${keypair.publicKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          Fund Testnet
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {keypairs.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No keypairs found
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-sm text-slate-600">
            Total keypairs: {keypairs.length}
          </div>
        </div>
      </div>
    </div>
  )
}

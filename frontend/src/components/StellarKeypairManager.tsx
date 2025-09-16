'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface KeypairData {
  publicKey: string
  funded?: boolean
  testnetFundingUrl?: string
}

interface UserKeypairs {
  testnet: KeypairData | null
  mainnet: KeypairData | null
  githubUsername: string
  createdAt: string
  updatedAt: string
}

export default function StellarKeypairManager() {
  const { data: session } = useSession()
  const [keypairs, setKeypairs] = useState<UserKeypairs | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Removed mainnet tab - only testnet available
  const [activeTab, setActiveTab] = useState<'testnet'>('testnet')
  const [showImportForm, setShowImportForm] = useState(false)
  const [importData, setImportData] = useState({ publicKey: '', secretKey: '' })

  useEffect(() => {
    if (session) {
      loadKeypairs()
    }
  }, [session])

  const loadKeypairs = async () => {
    if (!session) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stellar/keypairs')

      if (!response.ok) {
        throw new Error('Failed to load keypairs')
      }

      const data = await response.json()
      setKeypairs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const generateKeypair = async (network: 'testnet') => {
    if (!session) {
      setError('Please login with GitHub first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stellar/keypairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network,
          action: 'generate'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate keypair')
      }

      await loadKeypairs() // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const importKeypair = async (network: 'testnet') => {
    if (!session) {
      setError('Please login with GitHub first')
      return
    }

    if (!importData.publicKey || !importData.secretKey) {
      setError('Both public key and secret key are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stellar/keypairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network,
          action: 'import',
          publicKey: importData.publicKey,
          secretKey: importData.secretKey
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import keypair')
      }

      setImportData({ publicKey: '', secretKey: '' })
      setShowImportForm(false)
      await loadKeypairs() // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fundTestnetAccount = (publicKey: string) => {
    window.open(`https://friendbot.stellar.org?addr=${publicKey}`, '_blank')
  }

  if (!session) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6">
        <p className="text-slate-600">Please login with GitHub to manage your Stellar keypairs</p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6">
      <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center">
          <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        Stellar Keypair Manager
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Testnet Keypair Section */}
      <div className="space-y-4">
        {loading && (
          <p className="text-slate-600">Loading...</p>
        )}

        {!loading && keypairs && (
          <div>
            <h3 className="text-base font-medium text-slate-900 mb-4">Stellar Testnet Keypair</h3>
            <p className="text-sm text-slate-600 mb-4">
              Testnet is used for development and testing. It uses fake XLM that has no real value.
            </p>
            {keypairs.testnet ? (
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Public Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={keypairs.testnet.publicKey}
                      readOnly
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(keypairs.testnet!.publicKey)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fundTestnetAccount(keypairs.testnet!.publicKey)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Fund Account
                  </button>
                  <button
                    onClick={() => generateKeypair('testnet')}
                    disabled={loading}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-6 text-center">
                <p className="text-slate-600 mb-4">No testnet keypair found</p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => generateKeypair('testnet')}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Generate New
                  </button>
                  <button
                    onClick={() => setShowImportForm(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    Import Existing
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import Form Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Import Testnet Keypair
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-700 text-sm">
                ℹ️ You are importing a testnet keypair for development and testing.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Public Key
                </label>
                <input
                  type="text"
                  value={importData.publicKey}
                  onChange={(e) => setImportData({ ...importData, publicKey: e.target.value })}
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={importData.secretKey}
                  onChange={(e) => setImportData({ ...importData, secretKey: e.target.value })}
                  placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => importKeypair('testnet')}
                disabled={loading || !importData.publicKey || !importData.secretKey}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
              <button
                onClick={() => {
                  setShowImportForm(false)
                  setImportData({ publicKey: '', secretKey: '' })
                }}
                className="flex-1 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

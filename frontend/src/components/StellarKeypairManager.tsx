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
  const [activeTab, setActiveTab] = useState<'testnet' | 'mainnet'>('testnet')
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

  const generateKeypair = async (network: 'testnet' | 'mainnet') => {
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

  const importKeypair = async (network: 'testnet' | 'mainnet') => {
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
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <p className="text-white/60">Please login with GitHub to manage your Stellar keypairs</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
      <h2 className="text-2xl font-semibold text-white mb-6">Stellar Keypair Manager</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Network Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('testnet')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'testnet'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Testnet
        </button>
        <button
          onClick={() => setActiveTab('mainnet')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'mainnet'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Mainnet
        </button>
      </div>

      {/* Keypair Display */}
      <div className="space-y-4">
        {loading && (
          <p className="text-white/60">Loading...</p>
        )}

        {!loading && keypairs && (
          <div>
            {activeTab === 'testnet' ? (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Testnet Keypair</h3>
                {keypairs.testnet ? (
                  <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Public Key
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={keypairs.testnet.publicKey}
                          readOnly
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(keypairs.testnet!.publicKey)}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fundTestnetAccount(keypairs.testnet!.publicKey)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                      >
                        Fund Account
                      </button>
                      <button
                        onClick={() => generateKeypair('testnet')}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-6 text-center">
                    <p className="text-white/60 mb-4">No testnet keypair found</p>
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => generateKeypair('testnet')}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                      >
                        Generate New
                      </button>
                      <button
                        onClick={() => setShowImportForm(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Import Existing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Mainnet Keypair</h3>
                {keypairs.mainnet ? (
                  <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Public Key
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={keypairs.mainnet.publicKey}
                          readOnly
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(keypairs.mainnet!.publicKey)}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-3">
                      <p className="text-yellow-200 text-sm">
                        ⚠️ Warning: This is your mainnet keypair. Handle with extreme care!
                      </p>
                    </div>
                    <button
                      onClick={() => generateKeypair('mainnet')}
                      disabled={loading}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      Regenerate
                    </button>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-6 text-center">
                    <p className="text-white/60 mb-4">No mainnet keypair found</p>
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                      <p className="text-yellow-200 text-sm">
                        ⚠️ Warning: Mainnet keypairs handle real XLM. Be extremely careful!
                      </p>
                    </div>
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => generateKeypair('mainnet')}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                      >
                        Generate New
                      </button>
                      <button
                        onClick={() => setShowImportForm(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Import Existing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import Form Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-white/20 p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Import {activeTab} Keypair
            </h3>

            {activeTab === 'mainnet' && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-red-200 text-sm">
                  ⚠️ You are importing a mainnet keypair that handles real XLM!
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Public Key
                </label>
                <input
                  type="text"
                  value={importData.publicKey}
                  onChange={(e) => setImportData({ ...importData, publicKey: e.target.value })}
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={importData.secretKey}
                  onChange={(e) => setImportData({ ...importData, secretKey: e.target.value })}
                  placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => importKeypair(activeTab)}
                disabled={loading || !importData.publicKey || !importData.secretKey}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
              <button
                onClick={() => {
                  setShowImportForm(false)
                  setImportData({ publicKey: '', secretKey: '' })
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
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

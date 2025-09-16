"use client"

import { useStellarKeypair } from '../hooks/useStellarKeypair'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function StellarWallet() {
  const { data: session } = useSession()
  const { keypair, loading, error, generateKeypair, fundTestnetAccount, hasKeypair } = useStellarKeypair()
  const [showFullAddress, setShowFullAddress] = useState(false)

  if (!session) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.866 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Stellar Wallet</h3>
          <p className="text-sm text-slate-600">
            Login with GitHub to generate your Stellar keypair
          </p>
        </div>
      </div>
    )
  }

  const formatAddress = (address: string | undefined) => {
    if (!address) return ''
    if (showFullAddress) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          Stellar Wallet
        </h3>
        {hasKeypair && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200">
            Connected
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-blue-600 border-r-blue-600"></div>
        </div>
      ) : hasKeypair && keypair ? (
        <div className="space-y-4">
          {/* Public Key */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Public Key</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-sm text-slate-900 font-mono">
                  {formatAddress(keypair.publicKey)}
                </span>
              </div>
              <button
                onClick={() => setShowFullAddress(!showFullAddress)}
                className="bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200 p-2 rounded-lg"
                title={showFullAddress ? "Hide full address" : "Show full address"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                onClick={() => copyToClipboard(keypair.publicKey)}
                className="bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200 p-2 rounded-lg"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Linked to: <span className="text-slate-900">{keypair.githubUsername}</span>
            </span>
            <span className="text-slate-500">
              Created: {new Date(keypair.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={fundTestnetAccount}
              className="w-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 backdrop-blur-sm transition-all duration-200 font-medium text-sm h-10 rounded-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Fund Testnet Account
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Get 10,000 test XLM for development
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            No Stellar Wallet Found
          </h4>
          <p className="text-sm text-slate-600 mb-4">
            Generate a new Stellar keypair linked to your GitHub account
          </p>
          <button
            onClick={generateKeypair}
            disabled={loading}
            className="bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 backdrop-blur-sm transition-all duration-200 font-medium text-sm h-10 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Stellar Keypair
          </button>
        </div>
      )}
    </div>
  )
}

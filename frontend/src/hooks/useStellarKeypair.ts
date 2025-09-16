import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface StellarKeypair {
  publicKey: string
  githubUsername: string
  createdAt: string
  testnetFundingUrl: string
}

export function useStellarKeypair() {
  const { data: session } = useSession()
  const [keypair, setKeypair] = useState<StellarKeypair | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing keypair on mount
  useEffect(() => {
    if (session) {
      loadKeypair()
    }
  }, [session])

  const loadKeypair = async () => {
    if (!session) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stellar/keypair')

      if (response.status === 404) {
        // No keypair found - this is normal for new users
        setKeypair(null)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to load Stellar keypair')
      }

      const data = await response.json()
      setKeypair(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const generateKeypair = async () => {
    if (!session) {
      setError('Please login with GitHub first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stellar/keypair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate Stellar keypair')
      }

      const data = await response.json()
      setKeypair(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fundTestnetAccount = async () => {
    if (!keypair) {
      setError('No keypair available')
      return
    }

    try {
      // Open Stellar Friendbot in new tab to fund the account
      window.open(keypair.testnetFundingUrl, '_blank')
    } catch (err) {
      setError('Failed to open funding URL')
    }
  }

  return {
    keypair,
    loading,
    error,
    generateKeypair,
    loadKeypair,
    fundTestnetAccount,
    hasKeypair: !!keypair
  }
}

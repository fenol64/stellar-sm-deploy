"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface DeploymentInfo {
  id: string
  name: string
  repositoryUrl: string
  network: string
  deployedAt: string
}

export default function DeploySuccessPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [deployment, setDeployment] = useState<DeploymentInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const deploymentId = searchParams.get('id')
  const projectName = searchParams.get('name')
  const network = searchParams.get('network')

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    if (deploymentId) {
      // Fetch deployment details if we have an ID
      fetchDeploymentDetails(deploymentId)
    } else if (projectName && network) {
      // Use URL params if no ID
      setDeployment({
        id: 'unknown',
        name: projectName,
        repositoryUrl: '',
        network: network,
        deployedAt: new Date().toISOString()
      })
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [session, deploymentId, projectName, network, router])

  const fetchDeploymentDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/deployments/${id}`)
      if (response.ok) {
        const data = await response.json()
        setDeployment(data)
      }
    } catch (error) {
      console.error('Failed to fetch deployment details:', error)
    } finally {
      setLoading(false)
    }
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
                Deployment Successful
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Hero */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            🎉 <span className="text-yellow-600">Deployment Successful!</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your smart contract has been successfully deployed to the Stellar testnet.
          </p>
        </div>

        {/* Deployment Details */}
        {deployment && (
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Deployment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Project Name</label>
                <p className="text-slate-900">{deployment.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Network</label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-900 capitalize">{deployment.network}</span>
                </div>
              </div>
              {deployment.repositoryUrl && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Repository</label>
                  <a
                    href={deployment.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                  >
                    {deployment.repositoryUrl}
                  </a>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Deployed At</label>
                <p className="text-slate-900">{new Date(deployment.deployedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-slate-900 font-medium">Test Your Contract</p>
                <p className="text-slate-600 text-sm">Use Stellar CLI or SDK to interact with your deployed contract on testnet.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="text-slate-900 font-medium">Monitor Performance</p>
                <p className="text-slate-600 text-sm">Check your contract's performance and usage through Stellar explorers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="text-slate-900 font-medium">Deploy More Contracts</p>
                <p className="text-slate-600 text-sm">Continue building and deploying more smart contracts to expand your project.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z" />
            </svg>
            Back to Dashboard
          </Link>
          <Link
            href="/add"
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Deploy Another Contract
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 text-center">
          <h4 className="text-lg font-medium text-slate-900 mb-4">Helpful Resources</h4>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://stellar.org/developers/smart-contracts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
            >
              Stellar Smart Contracts Documentation
            </a>
            <a
              href="https://soroban.stellar.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
            >
              Soroban Documentation
            </a>
            <a
              href="https://stellar.expert/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
            >
              Stellar Explorer
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

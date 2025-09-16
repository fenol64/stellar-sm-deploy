"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import LoginButton from "../components/LoginButton"
import ProjectList from "../components/ProjectList"
import StellarWallet from "../components/StellarWallet"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-white border-r-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <header className="border-b border-gray-700/50 backdrop-blur-sm bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">
                Stellar Smart Contract Deploy
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {session && (
                <Link
                  href="/settings"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/30"
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              )}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome back, {session.user?.name?.split(' ')[0]}!
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Manage your Stellar smart contracts and deploy new projects to the network.
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Projects (2/3 width) */}
              <div className="lg:col-span-2">
                <ProjectList />
              </div>

              {/* Right Column - Wallet & Actions (1/3 width) */}
              <div className="space-y-6">
                <StellarWallet />

                {/* Quick Actions */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link
                      href="/add"
                      className="flex items-center gap-3 p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors group"
                    >
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-700 transition-colors">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-white">New Project</div>
                        <div className="text-sm text-purple-300">Deploy a smart contract</div>
                      </div>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors group"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-white">Settings</div>
                        <div className="text-sm text-blue-300">Manage your account</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-4xl font-bold text-white mb-4">
                Let's build something new.
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Connect your GitHub account to start deploying smart contracts to the Stellar network.
              </p>
              <div className="space-y-4">
                <LoginButton />
                <p className="text-sm text-gray-500">
                  Secure authentication with GitHub OAuth
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

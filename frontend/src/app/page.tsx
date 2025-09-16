"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import LoginButton from "../components/LoginButton"
import RepositoriesList from "../components/RepositoriesList"
import RecentDeploymentsList from "../components/RecentDeploymentsList"
import StellarWallet from "../components/StellarWallet"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
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
            <div className="flex items-center gap-3">
              <img
                src="/stellar.svg"
                alt="Stellar"
                className="h-6 w-auto text-blue-700"
                style={{ filter: 'hue-rotate(220deg) saturate(1.2)' }}
              />
              <h1 className="text-xl font-bold text-slate-900">
                Smart Contract Deploy
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {session && (
                <Link
                  href="/settings"
                  className="text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100/50"
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
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Welcome back, {session.user?.name?.split(' ')[0]}!
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Manage your Stellar smart contracts and deploy new projects to the network.
              </p>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-blue-200/60 p-6 mb-8 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/add"
                  className="flex items-center gap-3 p-4 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">New Project</div>
                    <div className="text-sm text-blue-700">Deploy a smart contract</div>
                  </div>
                </Link>

                <Link
                  href="/repositories"
                  className="flex items-center gap-3 p-4 bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center group-hover:bg-teal-700 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">My Repositories</div>
                    <div className="text-sm text-teal-700">View all imported repos</div>
                  </div>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-4 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Settings</div>
                    <div className="text-sm text-amber-700">Manage your account</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="space-y-8">
              {/* Repositories Section - Full Width */}
              <div>
                <RepositoriesList />
              </div>

              {/* Bottom Section - Wallet and Recent Deployments */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Wallet - Smaller column */}
                <div className="lg:col-span-1">
                  <StellarWallet />
                </div>

                {/* Recent Deployments - Larger column (3/4 width) */}
                <div className="lg:col-span-3">
                  <RecentDeploymentsList />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="max-w-lg mx-auto text-center px-6">
              {/* Hero Logo */}
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center p-4">
                <img
                  src="/stellar.svg"
                  alt="Stellar"
                  className="w-full h-auto text-white"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>

              <h2 className="text-5xl font-bold text-slate-900 mb-6">
                Welcome to Stellar Deploy
              </h2>
              <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                Connect your GitHub account to start deploying smart contracts to the Stellar network.
                Build the future of decentralized applications with ease.
              </p>

              {/* Login Button - Centered and Prominent */}
              <div className="flex flex-col items-center space-y-6">
                <div className="w-full max-w-sm">
                  <LoginButton />
                </div>
                <p className="text-sm text-slate-500">
                  🔒 Secure authentication with GitHub OAuth
                </p>
              </div>

              {/* Features */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-lg p-6 shadow-sm">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Easy Deploy</h3>
                  <p className="text-sm text-slate-600">Deploy smart contracts with just a few clicks</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm border border-green-200/60 rounded-lg p-6 shadow-sm">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure</h3>
                  <p className="text-sm text-slate-600">Built-in security and wallet management</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm border border-purple-200/60 rounded-lg p-6 shadow-sm">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Fast</h3>
                  <p className="text-sm text-slate-600">Lightning-fast deployments to Stellar network</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

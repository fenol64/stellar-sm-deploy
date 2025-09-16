"use client"

import { useSession } from "next-auth/react"
import LoginButton from "../../components/LoginButton"
import StellarKeypairManager from "../../components/StellarKeypairManager"
import Link from "next/link"

export default function SettingsPage() {
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
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <img
                src="/stellar.svg"
                alt="Stellar"
                className="h-6 w-auto text-slate-900"
              />
              <h1 className="text-xl font-bold text-slate-900">
                Settings
              </h1>
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session ? (
          <div className="space-y-8">
            {/* Page Header */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Account Settings
              </h2>
              <p className="text-slate-600">
                Manage your Stellar wallet and deployment configurations
              </p>
            </div>

            {/* Settings Sections */}
            <div className="grid gap-8">
              {/* GitHub Account Section */}
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  GitHub Account
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={session.user?.image || "/default-avatar.png"}
                      alt="GitHub Avatar"
                      className="w-12 h-12 rounded-full ring-2 ring-slate-200"
                    />
                    <div>
                      <p className="font-medium text-slate-900">
                        {session.user?.name || "GitHub User"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {session.user?.email || "No email provided"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-success-100 text-success-700 px-3 py-1 rounded-full border border-success-200">
                    Connected
                  </span>
                </div>
              </div>

              {/* Stellar Keypair Manager */}
              <StellarKeypairManager />

              {/* Deployment Preferences */}
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Deployment Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Default Network
                    </label>
                    <select className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <option value="testnet">Testnet (Development and Testing)</option>
                    </select>
                    <p className="text-xs text-slate-600 mt-1">
                      Mainnet deployments are currently disabled for safety.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Auto-fund Testnet Accounts
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mr-2 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">
                        Automatically fund new testnet accounts with 10,000 XLM
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Build Notifications
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mr-2 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">
                        Receive notifications when builds complete
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <button className="bg-blue-100 border border-blue-200 text-blue-700 hover:bg-blue-200 hover:border-blue-300 hover:text-blue-800 backdrop-blur-sm transition-all duration-200 font-medium text-sm h-10 px-4 rounded-lg">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-warning-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.866 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Authentication Required
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Please login with your GitHub account to access settings.
              </p>
              <LoginButton />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

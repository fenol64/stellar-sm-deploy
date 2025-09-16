"use client"

import { useSession } from "next-auth/react"
import LoginButton from "../components/LoginButton"
import RepositoryList from "../components/RepositoryList"
import TemplateList from "../components/TemplateList"

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
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Let's build something new.
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                To deploy a new Project, import an existing Git Repository or get started with one of our Templates.
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column - Repositories */}
              <div className="space-y-6">
                <RepositoryList />
              </div>

              {/* Right Column - Templates */}
              <div className="space-y-6">
                <TemplateList />
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

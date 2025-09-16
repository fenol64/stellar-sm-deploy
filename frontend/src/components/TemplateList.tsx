"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Template {
  id: string
  name: string
  description: string
  language: string
  features: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  repoUrl: string
}

const templates: Template[] = [
  {
    id: 'hello-world',
    name: 'Hello World Contract',
    description: 'A simple smart contract that demonstrates basic Soroban functionality with greeting messages.',
    language: 'Rust',
    features: ['Basic contract structure', 'String handling', 'Simple state management'],
    difficulty: 'Beginner',
    tags: ['starter', 'tutorial', 'basic'],
    repoUrl: 'https://github.com/stellar/soroban-examples/tree/main/hello_world'
  },
  {
    id: 'token-contract',
    name: 'Token Contract',
    description: 'A complete ERC-20 style token implementation with minting, burning, and transfer capabilities.',
    language: 'Rust',
    features: ['Token standard', 'Minting/Burning', 'Transfer logic', 'Balance tracking'],
    difficulty: 'Intermediate',
    tags: ['token', 'defi', 'standard'],
    repoUrl: 'https://github.com/stellar/soroban-examples/tree/main/token'
  },
  {
    id: 'liquidity-pool',
    name: 'Liquidity Pool',
    description: 'Automated Market Maker (AMM) implementation for decentralized trading with liquidity provision.',
    language: 'Rust',
    features: ['AMM logic', 'Liquidity provision', 'Swap functionality', 'Fee collection'],
    difficulty: 'Advanced',
    tags: ['defi', 'amm', 'trading', 'liquidity'],
    repoUrl: 'https://github.com/stellar/soroban-examples/tree/main/liquidity_pool'
  },
  {
    id: 'crowdfunding',
    name: 'Crowdfunding Contract',
    description: 'A decentralized crowdfunding platform with goal tracking and automatic refunds.',
    language: 'Rust',
    features: ['Campaign management', 'Goal tracking', 'Automatic refunds', 'Contributor rewards'],
    difficulty: 'Intermediate',
    tags: ['crowdfunding', 'campaign', 'social'],
    repoUrl: 'https://github.com/stellar/soroban-examples/tree/main/crowdfund'
  },
  {
    id: 'timelock',
    name: 'Timelock Contract',
    description: 'Time-based contract execution with delayed transactions and scheduled operations.',
    language: 'Rust',
    features: ['Time delays', 'Scheduled execution', 'Security patterns', 'Multi-sig support'],
    difficulty: 'Advanced',
    tags: ['security', 'timelock', 'multisig'],
    repoUrl: 'https://github.com/stellar/soroban-examples/tree/main/timelock'
  },
  {
    id: 'nft-contract',
    name: 'NFT Contract',
    description: 'Non-Fungible Token implementation with metadata support and marketplace functionality.',
    language: 'Rust',
    features: ['NFT standard', 'Metadata storage', 'Transfer mechanics', 'Marketplace integration'],
    difficulty: 'Intermediate',
    tags: ['nft', 'collectibles', 'metadata'],
    repoUrl: 'https://github.com/stellar/soroban-examples/tree/main/single_offer'
  }
]

const difficultyColors = {
  'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

export default function TemplateList() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const router = useRouter()

  const filteredTemplates = templates.filter(template => {
    if (filter === 'all') return true
    return template.difficulty.toLowerCase() === filter
  })

  const handleUseTemplate = (template: Template) => {
    // Navigate to deploy page with template information
    router.push(`/deploy?template=${encodeURIComponent(template.id)}&repo=${encodeURIComponent(template.repoUrl)}&name=${encodeURIComponent(template.name)}`)
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 h-fit">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">
            Clone Template
          </h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800/50 border border-gray-700/50 text-white text-sm rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-gray-600"
          >
            <option value="all">Framework</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {filteredTemplates.slice(0, 4).map((template) => (
          <div key={template.id} className="group">
            <div className="bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-lg p-4 hover:bg-gray-800/40 hover:border-gray-600/50 transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    {template.id === 'hello-world' && (
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    )}
                    {template.id === 'token-contract' && (
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {template.id === 'liquidity-pool' && (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    )}
                    {template.id === 'crowdfunding' && (
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                    {(template.id === 'timelock' || template.id === 'nft-contract') && (
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">
                      {template.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${template.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : template.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                        {template.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${selectedTemplate?.id === template.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUseTemplate(template)
                    }}
                    className="bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white backdrop-blur-sm transition-all duration-200 font-medium text-sm h-8 px-3 rounded-md opacity-0 group-hover:opacity-100"
                  >
                    Clone
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedTemplate?.id === template.id && (
                <div className="mt-4 pt-4 border-t border-gray-700/30">
                  <p className="text-sm text-gray-300 mb-3">
                    {template.description}
                  </p>
                  <div className="space-y-2">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                        <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Browse All Templates */}
      <div className="border-t border-gray-700/50 pt-4">
        <button
          onClick={() => setSelectedTemplate(null)}
          className="w-full text-left text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Browse All Templates →
        </button>
      </div>
    </div>
  )
}

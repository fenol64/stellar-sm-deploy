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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Smart Contract Templates
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[template.difficulty]}`}>
                    {template.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {template.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    {template.language}
                  </span>
                  <span>{template.features.length} features</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleUseTemplate(template)
                }}
                className="ml-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Use Template
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Expandable Details */}
            {selectedTemplate?.id === template.id && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Features:</h5>
                <ul className="space-y-1">
                  {template.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={template.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                    View Source Code
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No templates found for this difficulty level</p>
        </div>
      )}
    </div>
  )
}

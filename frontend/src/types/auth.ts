import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface JWT {
    accessToken?: string
    id?: string
  }
}

export interface StellarKeypair {
  publicKey: string
  githubUsername: string
  createdAt: string
  testnetFundingUrl: string
}

export interface StellarKeypairResponse {
  message: string
  publicKey: string
  githubUsername: string
  createdAt: Date
  testnetFundingUrl: string
}

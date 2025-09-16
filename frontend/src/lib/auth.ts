import GithubProvider from "next-auth/providers/github"
import { NextAuthOptions } from "next-auth"
import { prisma } from "./prisma"

interface GitHubProfile {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  [key: string]: any
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "github" || !profile) {
        return true
      }

      try {
        const githubProfile = profile as GitHubProfile
        
        await prisma.user.upsert({
          where: {
            githubId: githubProfile.id.toString(),
          },
          create: {
            githubId: githubProfile.id.toString(),
            githubUsername: githubProfile.login || '',
            name: githubProfile.name,
            email: githubProfile.email,
            image: githubProfile.avatar_url,
          },
          update: {
            githubUsername: githubProfile.login || '',
            name: githubProfile.name,
            email: githubProfile.email,
            image: githubProfile.avatar_url,
          },
        })
        
        console.log(`User upserted successfully: ${githubProfile.login} (${githubProfile.id})`)

        return true

      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      }
    },

    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        if (profile) {
            token.id = (profile as GitHubProfile).id.toString()
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        // Expõe o accessToken e o ID do usuário para o cliente
        session.accessToken = token.accessToken as string
        session.user.id = token.id as string
      }
      return session
    },
  }
}

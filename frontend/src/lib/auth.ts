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
      if (account?.provider === "github" && profile) {
        try {
          const githubProfile = profile as GitHubProfile
          
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { githubId: githubProfile.id.toString() }
          })

          // If user doesn't exist, create them
          if (!existingUser) {
            await prisma.user.create({
              data: {
                githubId: githubProfile.id.toString(),
                githubUsername: githubProfile.login || githubProfile.name || '',
                name: githubProfile.name,
                email: githubProfile.email,
                image: githubProfile.avatar_url
              }
            })
            console.log(`New user created: ${githubProfile.login} (${githubProfile.id})`)
          } else {
            // Update user info in case it changed
            await prisma.user.update({
              where: { githubId: githubProfile.id.toString() },
              data: {
                githubUsername: githubProfile.login || githubProfile.name || existingUser.githubUsername,
                name: githubProfile.name || existingUser.name,
                email: githubProfile.email || existingUser.email,
                image: githubProfile.avatar_url || existingUser.image
              }
            })
            console.log(`User updated: ${githubProfile.login} (${githubProfile.id})`)
          }
        } catch (error) {
          console.error('Error creating/updating user:', error)
          // Don't block login if database operation fails
        }
      }
      return true
    },
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.id = (profile as any)?.id?.toString()
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (session.user) {
        session.accessToken = token.accessToken as string
        session.user.id = token.id as string
      }
      return session
    },
  }
}

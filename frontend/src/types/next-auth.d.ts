import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id?: string
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

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    id?: string
  }
}

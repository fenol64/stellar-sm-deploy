import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Keypair } from '@stellar/stellar-sdk'
import { authOptions } from '../../../../lib/auth'

// In-memory storage for demo purposes - in production, use a proper database
const userKeypairs = new Map<string, {
  publicKey: string
  secretKey: string
  githubId: string
  githubUsername: string
  createdAt: Date
}>()

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login with GitHub' },
        { status: 401 }
      )
    }

    // Check if user already has a keypair
    const existingKeypair = Array.from(userKeypairs.values()).find(
      kp => kp.githubId === session.user?.id || kp.githubUsername === session.user?.name
    )

    if (existingKeypair) {
      return NextResponse.json({
        message: 'Keypair already exists for this GitHub account',
        publicKey: existingKeypair.publicKey,
        githubUsername: existingKeypair.githubUsername,
        createdAt: existingKeypair.createdAt
      })
    }

    // Generate new Stellar keypair
    const keypair = Keypair.random()
    const publicKey = keypair.publicKey()
    const secretKey = keypair.secret()

    // Store the keypair linked to GitHub account
    const keypairData = {
      publicKey,
      secretKey,
      githubId: session.user.id || '',
      githubUsername: session.user.name || session.user.email || '',
      createdAt: new Date()
    }

    userKeypairs.set(publicKey, keypairData)

    // Return public information (never return secret key in response)
    return NextResponse.json({
      message: 'Stellar keypair generated successfully',
      publicKey,
      githubUsername: keypairData.githubUsername,
      createdAt: keypairData.createdAt,
      testnetFundingUrl: `https://friendbot.stellar.org?addr=${publicKey}`
    })

  } catch (error) {
    console.error('Error generating Stellar keypair:', error)
    return NextResponse.json(
      { error: 'Failed to generate Stellar keypair' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login with GitHub' },
        { status: 401 }
      )
    }

    // Find user's keypair
    const userKeypair = Array.from(userKeypairs.values()).find(
      kp => kp.githubId === session.user?.id || kp.githubUsername === session.user?.name
    )

    if (!userKeypair) {
      return NextResponse.json(
        { error: 'No Stellar keypair found for this GitHub account' },
        { status: 404 }
      )
    }

    // Return public information only
    return NextResponse.json({
      publicKey: userKeypair.publicKey,
      githubUsername: userKeypair.githubUsername,
      createdAt: userKeypair.createdAt,
      testnetFundingUrl: `https://friendbot.stellar.org?addr=${userKeypair.publicKey}`
    })

  } catch (error) {
    console.error('Error retrieving Stellar keypair:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve Stellar keypair' },
      { status: 500 }
    )
  }
}

// Helper function to get secret key (for internal use only)
export function getUserSecretKey(publicKey: string): string | null {
  const keypair = userKeypairs.get(publicKey)
  return keypair ? keypair.secretKey : null
}

// Helper function to list all keypairs (for admin purposes)
export async function getAllKeypairs() {
  return Array.from(userKeypairs.values()).map(kp => ({
    publicKey: kp.publicKey,
    githubUsername: kp.githubUsername,
    createdAt: kp.createdAt
  }))
}

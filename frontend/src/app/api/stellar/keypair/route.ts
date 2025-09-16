import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Keypair } from '@stellar/stellar-sdk'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

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

    const githubId = session.user.id || ''

    // Find user in database (should exist from login callback)
    const user = await prisma.user.findUnique({
      where: { githubId },
      include: { stellarKeypairs: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database. Please try logging out and back in.' },
        { status: 404 }
      )
    }

    // Check if user already has a keypair
    if (user.stellarKeypairs.length > 0) {
      const existingKeypair = user.stellarKeypairs[0]
      return NextResponse.json({
        message: 'Keypair already exists for this GitHub account',
        publicKey: existingKeypair.publicKey,
        githubUsername: user.githubUsername,
        createdAt: existingKeypair.createdAt
      })
    }

    // Generate new Stellar keypair
    const keypair = Keypair.random()
    const publicKey = keypair.publicKey()
    const secretKey = keypair.secret()

    // Store the keypair in database
    const stellarKeypair = await prisma.stellarKeypair.create({
      data: {
        publicKey,
        secretKey, // TODO: Encrypt this in production
        userId: user.id
      }
    })

    // Return public information (never return secret key in response)
    return NextResponse.json({
      message: 'Stellar keypair generated successfully',
      publicKey: stellarKeypair.publicKey,
      githubUsername: user.githubUsername,
      createdAt: stellarKeypair.createdAt,
      testnetFundingUrl: `https://friendbot.stellar.org?addr=${stellarKeypair.publicKey}`
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

    const githubId = session.user.id || ''

    // Find user and their keypair
    const user = await prisma.user.findUnique({
      where: { githubId },
      include: { stellarKeypairs: true }
    })

    if (!user || user.stellarKeypairs.length === 0) {
      return NextResponse.json(
        { error: 'No Stellar keypair found for this GitHub account' },
        { status: 404 }
      )
    }

    const userKeypair = user.stellarKeypairs[0]

    return NextResponse.json({
      publicKey: userKeypair.publicKey,
      githubUsername: user.githubUsername,
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
export async function getUserSecretKey(publicKey: string): Promise<string | null> {
  try {
    const stellarKeypair = await prisma.stellarKeypair.findUnique({
      where: { publicKey }
    })
    return stellarKeypair ? stellarKeypair.secretKey : null
  } catch (error) {
    console.error('Error retrieving secret key:', error)
    return null
  }
}

// Helper function to list all keypairs (for admin purposes)
export async function getAllKeypairs() {
  try {
    const keypairs = await prisma.stellarKeypair.findMany({
      include: { user: true }
    })
    return keypairs.map(kp => ({
      publicKey: kp.publicKey,
      githubUsername: kp.user.githubUsername,
      createdAt: kp.createdAt
    }))
  } catch (error) {
    console.error('Error retrieving all keypairs:', error)
    return []
  }
}

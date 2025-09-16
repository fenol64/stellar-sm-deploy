import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Keypair } from '@stellar/stellar-sdk'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login with GitHub' },
        { status: 401 }
      )
    }

    const githubId = session.user.id || ''

    // Find user and their keypairs
    const user = await prisma.user.findUnique({
      where: { githubId },
      include: { stellarKeypairs: true }
    })

    if (!user || user.stellarKeypairs.length === 0) {
      return NextResponse.json({
        testnet: null,
        mainnet: null
      })
    }

    const keypair = user.stellarKeypairs[0]

    return NextResponse.json({
      testnet: keypair.testnetPublicKey ? {
        publicKey: keypair.testnetPublicKey,
        funded: keypair.testnetFunded,
        testnetFundingUrl: `https://friendbot.stellar.org?addr=${keypair.testnetPublicKey}`
      } : null,
      mainnet: keypair.mainnetPublicKey ? {
        publicKey: keypair.mainnetPublicKey,
        funded: keypair.mainnetFunded
      } : null,
      githubUsername: user.githubUsername,
      createdAt: keypair.createdAt,
      updatedAt: keypair.updatedAt
    })

  } catch (error) {
    console.error('Error retrieving keypairs:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve keypairs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login with GitHub' },
        { status: 401 }
      )
    }

    const { network, action, publicKey, secretKey } = await request.json()

    if (!network || !['testnet', 'mainnet'].includes(network)) {
      return NextResponse.json(
        { error: 'Invalid network. Must be testnet or mainnet' },
        { status: 400 }
      )
    }

    if (!action || !['generate', 'import'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be generate or import' },
        { status: 400 }
      )
    }

    const githubId = session.user.id || ''

    // Find user
    const user = await prisma.user.findUnique({
      where: { githubId },
      include: { stellarKeypairs: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let newPublicKey: string
    let newSecretKey: string

    if (action === 'generate') {
      // Generate new keypair
      const keypair = Keypair.random()
      newPublicKey = keypair.publicKey()
      newSecretKey = keypair.secret()
    } else if (action === 'import') {
      // Import existing keypair
      if (!publicKey || !secretKey) {
        return NextResponse.json(
          { error: 'Public key and secret key are required for import' },
          { status: 400 }
        )
      }

      try {
        // Validate the keypair
        const keypair = Keypair.fromSecret(secretKey)
        if (keypair.publicKey() !== publicKey) {
          return NextResponse.json(
            { error: 'Public key does not match secret key' },
            { status: 400 }
          )
        }
        newPublicKey = publicKey
        newSecretKey = secretKey
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid secret key format' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Update or create stellar keypair
    const updateData = network === 'testnet' ? {
      testnetPublicKey: newPublicKey,
      testnetSecretKey: newSecretKey,
      testnetFunded: false
    } : {
      mainnetPublicKey: newPublicKey,
      mainnetSecretKey: newSecretKey,
      mainnetFunded: false
    }

    let stellarKeypair
    if (user.stellarKeypairs.length > 0) {
      // Update existing keypair
      stellarKeypair = await prisma.stellarKeypair.update({
        where: { id: user.stellarKeypairs[0].id },
        data: updateData
      })
    } else {
      // Create new keypair record
      stellarKeypair = await prisma.stellarKeypair.create({
        data: {
          userId: user.id,
          ...updateData
        }
      })
    }

    const response: any = {
      message: `${network} keypair ${action}ed successfully`,
      network,
      publicKey: newPublicKey,
      githubUsername: user.githubUsername,
      createdAt: stellarKeypair.createdAt,
      updatedAt: stellarKeypair.updatedAt
    }

    if (network === 'testnet') {
      response.testnetFundingUrl = `https://friendbot.stellar.org?addr=${newPublicKey}`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error managing keypair:', error)
    return NextResponse.json(
      { error: 'Failed to manage keypair' },
      { status: 500 }
    )
  }
}

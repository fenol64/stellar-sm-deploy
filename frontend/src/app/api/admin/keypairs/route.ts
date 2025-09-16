import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

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

    // Get all keypairs with user info (for admin purposes)
    const keypairs = await prisma.stellarKeypair.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })

    const response = keypairs.map(kp => ({
      publicKey: kp.publicKey,
      githubUsername: kp.user.githubUsername,
      createdAt: kp.createdAt
    }))

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error retrieving all keypairs:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve keypairs' },
      { status: 500 }
    )
  }
}

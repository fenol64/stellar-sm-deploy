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

    // Get database statistics
    const [
      totalUsers,
      totalKeypairs,
      totalRepositories,
      totalDeployments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.stellarKeypair.count(),
      prisma.repository.count(),
      prisma.deployment.count()
    ])

    // Get recent activity
    const recentKeypairs = await prisma.stellarKeypair.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })

    const response = {
      statistics: {
        totalUsers,
        totalKeypairs,
        totalRepositories,
        totalDeployments
      },
      recentActivity: recentKeypairs.map(kp => ({
        publicKey: kp.publicKey,
        githubUsername: kp.user.githubUsername,
        createdAt: kp.createdAt
      }))
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error retrieving database stats:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve database statistics' },
      { status: 500 }
    )
  }
}

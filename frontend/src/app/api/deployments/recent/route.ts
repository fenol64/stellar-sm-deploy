import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user by github ID
    const user = await prisma.user.findUnique({
      where: {
        githubId: session.user.id
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get recent deployments for the user
    const deployments = await prisma.deployment.findMany({
      where: {
        userId: user.id
      },
      include: {
        repository: {
          select: {
            id: true,
            name: true,
            description: true,
            htmlUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Get last 5 deployments
    })

    return NextResponse.json({ deployments })
  } catch (error) {
    console.error('Error fetching recent deployments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent deployments' },
      { status: 500 }
    )
  }
}
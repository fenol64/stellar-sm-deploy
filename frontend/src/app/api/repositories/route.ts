import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { githubId: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const repositories = await prisma.repository.findMany({
      where: { userId: user.id },
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            network: true,
            createdAt: true,
            contractAddress: true
          }
        },
        _count: {
          select: { deployments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedRepos = repositories.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      description: repo.description,
      htmlUrl: repo.htmlUrl,
      cloneUrl: repo.cloneUrl,
      language: repo.language,
      private: repo.private,
      stargazers: repo.stargazers,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      deployments: repo.deployments,
      deploymentCount: repo._count.deployments
    }))

    return NextResponse.json({ repositories: formattedRepos })

  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

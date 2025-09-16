import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const repository = await prisma.repository.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          include: {
            stellarKeypair: {
              select: {
                testnetPublicKey: true
              }
            }
          }
        },
        _count: {
          select: { deployments: true }
        }
      }
    })

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: repository.id,
      name: repository.name,
      fullName: repository.fullName,
      description: repository.description,
      htmlUrl: repository.htmlUrl,
      cloneUrl: repository.cloneUrl,
      language: repository.language,
      private: repository.private,
      stargazers: repository.stargazers,
      createdAt: repository.createdAt,
      updatedAt: repository.updatedAt,
      deployments: repository.deployments,
      deploymentCount: repository._count.deployments
    })

  } catch (error) {
    console.error('Error fetching repository:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

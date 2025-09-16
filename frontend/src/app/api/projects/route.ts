import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

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

    // Find user and their deployments
    const user = await prisma.user.findUnique({
      where: { githubId },
      include: {
        deployments: {
          include: {
            repository: true,
            template: true
          },
          orderBy: { createdAt: 'desc' },
          take: 20 // Limit to recent deployments
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Transform deployments into project format
    const projects = user.deployments.map(deployment => ({
      id: deployment.id,
      name: deployment.repository?.name || deployment.template?.name || 'Unnamed Contract',
      description: deployment.repository?.description || deployment.template?.description || `Deployment on ${deployment.network}`,
      repositoryUrl: deployment.repository?.cloneUrl || deployment.template?.repoUrl || '',
      network: deployment.network,
      status: deployment.status.toLowerCase(),
      contractId: deployment.contractAddress,
      createdAt: deployment.createdAt,
      updatedAt: deployment.updatedAt,
      type: deployment.template ? 'template' : 'repository'
    }))

    return NextResponse.json({ projects })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

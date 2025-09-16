import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { githubId: session.user.id || '' }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const deployment = await prisma.deployment.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        repository: true,
        template: true
      }
    })

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: deployment.id,
      name: deployment.repository?.name || deployment.template?.name || 'Unknown Project',
      repositoryUrl: deployment.repository?.cloneUrl || deployment.repository?.htmlUrl || '',
      network: deployment.network,
      deployedAt: deployment.deployedAt?.toISOString() || deployment.createdAt.toISOString()
    })

  } catch (error) {
    console.error('Error fetching deployment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

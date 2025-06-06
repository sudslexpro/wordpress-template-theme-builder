import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/deployments/[id] - Get a specific deployment
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deployment = await prisma.deployment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        wordpressSite: true,
        theme: true,
        template: true,
      },
    });

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      );
    }

    // Verify user owns the WordPress site associated with this deployment
    const wordpressSite = await prisma.wordPressSite.findUnique({
      where: {
        id: deployment.wordpressSiteId,
        userId: session.user.id,
      },
    });

    if (!wordpressSite) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Error fetching deployment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deployment' },
      { status: 500 }
    );
  }
}

// PUT /api/deployments/[id] - Update a deployment (e.g., to update status or logs)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Check if deployment exists
    const existingDeployment = await prisma.deployment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        wordpressSite: true,
      },
    });

    if (!existingDeployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      );
    }

    // Verify user owns the WordPress site associated with this deployment
    const wordpressSite = await prisma.wordPressSite.findUnique({
      where: {
        id: existingDeployment.wordpressSiteId,
        userId: session.user.id,
      },
    });

    if (!wordpressSite) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedDeployment = await prisma.deployment.update({
      where: {
        id: params.id,
      },
      data: {
        status: data.status,
        logs: data.logs,
      },
    });

    return NextResponse.json(updatedDeployment);
  } catch (error) {
    console.error('Error updating deployment:', error);
    return NextResponse.json(
      { error: 'Failed to update deployment' },
      { status: 500 }
    );
  }
}

// DELETE /api/deployments/[id] - Delete a deployment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if deployment exists
    const existingDeployment = await prisma.deployment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        wordpressSite: true,
      },
    });

    if (!existingDeployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      );
    }

    // Verify user owns the WordPress site associated with this deployment
    const wordpressSite = await prisma.wordPressSite.findUnique({
      where: {
        id: existingDeployment.wordpressSiteId,
        userId: session.user.id,
      },
    });

    if (!wordpressSite) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the deployment
    await prisma.deployment.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deployment:', error);
    return NextResponse.json(
      { error: 'Failed to delete deployment' },
      { status: 500 }
    );
  }
}
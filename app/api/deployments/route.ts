import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/deployments - Get all deployments for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const wordpressSiteId = searchParams.get('wordpressSiteId');
    const themeId = searchParams.get('themeId');
    const templateId = searchParams.get('templateId');

    const whereClause: any = {};

    if (wordpressSiteId) {
      whereClause.wordpressSiteId = wordpressSiteId;
    }

    if (themeId) {
      whereClause.themeId = themeId;
    }

    if (templateId) {
      whereClause.templateId = templateId;
    }

    const deployments = await prisma.deployment.findMany({
      where: whereClause,
      include: {
        wordpressSite: true,
        theme: true,
        template: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(deployments);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deployments' },
      { status: 500 }
    );
  }
}

// POST /api/deployments - Create a new deployment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.wordpressSiteId || (!data.themeId && !data.templateId)) {
      return NextResponse.json(
        {
          error:
            'WordPress site ID and either theme ID or template ID are required',
        },
        { status: 400 }
      );
    }

    // Check if WordPress site exists and belongs to user
    const wordpressSite = await prisma.wordPressSite.findUnique({
      where: {
        id: data.wordpressSiteId,
        userId: session.user.id,
      },
    });

    if (!wordpressSite) {
      return NextResponse.json(
        { error: 'WordPress site not found or not owned by user' },
        { status: 404 }
      );
    }

    // If themeId is provided, verify it exists and belongs to the user
    if (data.themeId) {
      const theme = await prisma.theme.findUnique({
        where: {
          id: data.themeId,
          userId: session.user.id,
        },
      });

      if (!theme) {
        return NextResponse.json(
          { error: 'Theme not found or not owned by user' },
          { status: 404 }
        );
      }
    }

    // If templateId is provided, verify it exists and belongs to the user
    if (data.templateId) {
      const template = await prisma.template.findUnique({
        where: {
          id: data.templateId,
          userId: session.user.id,
        },
      });

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found or not owned by user' },
          { status: 404 }
        );
      }
    }

    // Create the deployment
    const deployment = await prisma.deployment.create({
      data: {
        deploymentType: data.themeId ? 'theme' : 'template',
        wordpressSiteId: data.wordpressSiteId,
        themeId: data.themeId || null,
        templateId: data.templateId || null,
      },
    });

    // TODO: Trigger the actual deployment process using n8n or other automation
    // This would be handled by a background job or webhook

    return NextResponse.json(deployment, { status: 201 });
  } catch (error) {
    console.error('Error creating deployment:', error);
    return NextResponse.json(
      { error: 'Failed to create deployment' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/templates - Get all templates for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const themeId = searchParams.get('themeId');

    const whereClause: any = {
      userId: session.user.id,
    };

    if (themeId) {
      whereClause.themeId = themeId;
    }

    const templates = await prisma.template.findMany({
      where: whereClause,
      include: {
        components: true,
        theme: true,
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

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

    const template = await prisma.template.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        htmlContent: data.htmlContent,
        cssStyles: data.cssStyles,
        jsScripts: data.jsScripts,
        phpCode: data.phpCode,
        status: data.status || 'draft',
        userId: session.user.id,
        themeId: data.themeId || null,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
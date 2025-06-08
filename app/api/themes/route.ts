import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/themes - Get all themes for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const themes = await prisma.theme.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        templates: true,
        components: true,
      },
    });

    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}

// POST /api/themes - Create a new theme
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const theme = await prisma.theme.create({
      data: {
        name: data.name,
        description: data.description,
        thumbnail: data.thumbnail,
        cssStyles: data.cssStyles,
        jsScripts: data.jsScripts,
        phpCode: data.phpCode,
        status: data.status || 'draft',
        userId: session.user.id,
      },
    });

    return NextResponse.json(theme, { status: 201 });
  } catch (error) {
    console.error('Error creating theme:', error);
    return NextResponse.json(
      { error: 'Failed to create theme' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/themes/[id] - Get a specific theme
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const theme = await prisma.theme.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        templates: true,
        components: true,
      },
    });

    if (!theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    return NextResponse.json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    );
  }
}

// PUT /api/themes/[id] - Update a theme
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

    // Check if theme exists and belongs to user
    const existingTheme = await prisma.theme.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTheme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    const updatedTheme = await prisma.theme.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        description: data.description,
        thumbnail: data.thumbnail,
        cssStyles: data.cssStyles,
        jsScripts: data.jsScripts,
        phpCode: data.phpCode,
        status: data.status,
      },
    });

    return NextResponse.json(updatedTheme);
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}

// DELETE /api/themes/[id] - Delete a theme
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if theme exists and belongs to user
    const existingTheme = await prisma.theme.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTheme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    // Delete the theme
    await prisma.theme.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting theme:', error);
    return NextResponse.json(
      { error: 'Failed to delete theme' },
      { status: 500 }
    );
  }
}
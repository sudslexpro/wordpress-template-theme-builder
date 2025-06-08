import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/templates/[id] - Get a specific template
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const template = await prisma.template.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        components: true,
        theme: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update a template
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

    // Check if template exists and belongs to user
    const existingTemplate = await prisma.template.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
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

    const updatedTemplate = await prisma.template.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        htmlContent: data.htmlContent,
        cssStyles: data.cssStyles,
        jsScripts: data.jsScripts,
        phpCode: data.phpCode,
        status: data.status,
        themeId: data.themeId,
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if template exists and belongs to user
    const existingTemplate = await prisma.template.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete the template
    await prisma.template.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/wordpress-sites/[id] - Get a specific WordPress site
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wordpressSite = await prisma.wordPressSite.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        deployments: true,
      },
    });

    if (!wordpressSite) {
      return NextResponse.json(
        { error: 'WordPress site not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information before returning
    const { password, apiKey, ...safeWordpressSite } = wordpressSite;

    return NextResponse.json(safeWordpressSite);
  } catch (error) {
    console.error('Error fetching WordPress site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WordPress site' },
      { status: 500 }
    );
  }
}

// PUT /api/wordpress-sites/[id] - Update a WordPress site
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

    // Check if WordPress site exists and belongs to user
    const existingWordpressSite = await prisma.wordPressSite.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingWordpressSite) {
      return NextResponse.json(
        { error: 'WordPress site not found' },
        { status: 404 }
      );
    }

    const updatedWordpressSite = await prisma.wordPressSite.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        url: data.url,
        apiUrl: data.apiUrl,
        username: data.username,
        password: data.password || existingWordpressSite.password,
        apiKey: data.apiKey || existingWordpressSite.apiKey,
      },
    });

    // Remove sensitive information before returning
    const { password, apiKey, ...safeWordpressSite } = updatedWordpressSite;

    return NextResponse.json(safeWordpressSite);
  } catch (error) {
    console.error('Error updating WordPress site:', error);
    return NextResponse.json(
      { error: 'Failed to update WordPress site' },
      { status: 500 }
    );
  }
}

// DELETE /api/wordpress-sites/[id] - Delete a WordPress site
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if WordPress site exists and belongs to user
    const existingWordpressSite = await prisma.wordPressSite.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingWordpressSite) {
      return NextResponse.json(
        { error: 'WordPress site not found' },
        { status: 404 }
      );
    }

    // Delete the WordPress site
    await prisma.wordPressSite.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting WordPress site:', error);
    return NextResponse.json(
      { error: 'Failed to delete WordPress site' },
      { status: 500 }
    );
  }
}
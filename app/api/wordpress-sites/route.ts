import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/wordpress-sites - Get all WordPress sites for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wordpressSites = await prisma.wordPressSite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        deployments: true,
      },
    });

    return NextResponse.json(wordpressSites);
  } catch (error) {
    console.error('Error fetching WordPress sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WordPress sites' },
      { status: 500 }
    );
  }
}

// POST /api/wordpress-sites - Create a new WordPress site
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const wordpressSite = await prisma.wordPressSite.create({
      data: {
        name: data.name,
        url: data.url,
        apiUrl: data.apiUrl,
        username: data.username,
        password: data.password,
        apiKey: data.apiKey,
        userId: session.user.id,
      },
    });

    // Remove sensitive information before returning
    const { password, apiKey, ...safeWordpressSite } = wordpressSite;

    return NextResponse.json(safeWordpressSite, { status: 201 });
  } catch (error) {
    console.error('Error creating WordPress site:', error);
    return NextResponse.json(
      { error: 'Failed to create WordPress site' },
      { status: 500 }
    );
  }
}
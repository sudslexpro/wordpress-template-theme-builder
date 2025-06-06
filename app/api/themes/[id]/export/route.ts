import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { generateWordPressTheme } from '@/lib/wordpress/theme-generator';

// GET /api/themes/[id]/export - Export a theme as WordPress theme files
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the theme with all related data
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

    // Generate WordPress theme files
    const themeFiles = await generateWordPressTheme(theme);

    // Return the generated files
    return NextResponse.json(themeFiles);
  } catch (error) {
    console.error('Error exporting theme:', error);
    return NextResponse.json(
      { error: 'Failed to export theme' },
      { status: 500 }
    );
  }
}
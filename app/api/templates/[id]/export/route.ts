import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { generateWordPressTemplate } from '@/lib/wordpress/template-generator';

// GET /api/templates/[id]/export - Export a template as WordPress template files
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the template with all related data
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

    // Generate WordPress template files
    const templateFiles = await generateWordPressTemplate(template);

    // Return the generated files
    return NextResponse.json(templateFiles);
  } catch (error) {
    console.error('Error exporting template:', error);
    return NextResponse.json(
      { error: 'Failed to export template' },
      { status: 500 }
    );
  }
}
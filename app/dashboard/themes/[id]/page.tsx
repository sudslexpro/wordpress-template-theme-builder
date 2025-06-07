import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Edit, Download, ArrowLeft, Plus } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThemeDetails from '@/components/themes/theme-details';
import ThemeTemplates from '@/components/themes/theme-templates';
import ThemePreview from '@/components/themes/theme-preview';

interface ThemePageProps {
  params: {
    id: string;
  };
}

export default async function ThemePage({ params }: ThemePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const theme = await prisma.theme.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      templates: {
        include: {
          components: true,
        },
      },
    },
  });

  if (!theme) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/themes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{theme.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/themes/${theme.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/api/themes/${theme.id}/export`}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-6">
          <ThemeDetails theme={theme} />
        </TabsContent>
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Templates</h2>
            <Button asChild>
              <Link href={`/dashboard/templates/new?themeId=${theme.id}`}>
                <Plus className="mr-2 h-4 w-4" /> Add Template
              </Link>
            </Button>
          </div>
          <ThemeTemplates themeId={theme.id} templates={theme.templates} />
        </TabsContent>
        <TabsContent value="preview" className="space-y-6">
          <ThemePreview theme={theme} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
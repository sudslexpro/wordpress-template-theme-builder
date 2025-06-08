import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Edit, Download, ArrowLeft, Plus, Palette } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateDetails from '@/components/templates/template-details';
import TemplateComponents from '@/components/templates/template-components';
import TemplatePreview from '@/components/templates/template-preview';
import TemplateCode from '@/components/templates/template-code';

interface TemplatePageProps {
  params: {
    id: string;
  };
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const template = await prisma.template.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      theme: true,
      components: true,
    },
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{template.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/templates/${template.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/api/templates/${template.id}/export`}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <Link 
          href={`/dashboard/themes/${template.theme.id}`}
          className="flex items-center text-sm text-primary hover:underline"
        >
          <Palette className="h-4 w-4 mr-1" />
          {template.theme.name}
        </Link>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-6">
          <TemplateDetails template={template} />
        </TabsContent>
        <TabsContent value="components" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Components</h2>
            <Button asChild>
              <Link href={`/dashboard/components/new?templateId=${template.id}`}>
                <Plus className="mr-2 h-4 w-4" /> Add Component
              </Link>
            </Button>
          </div>
          <TemplateComponents templateId={template.id} components={template.components} />
        </TabsContent>
        <TabsContent value="code" className="space-y-6">
          <TemplateCode template={template} />
        </TabsContent>
        <TabsContent value="preview" className="space-y-6">
          <TemplatePreview template={template} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
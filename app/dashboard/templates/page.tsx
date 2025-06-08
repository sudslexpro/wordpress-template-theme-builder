import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import TemplateCard from '@/components/templates/template-card';

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const templates = await prisma.template.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      theme: {
        select: {
          id: true,
          name: true,
        },
      },
      components: {
        select: {
          id: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Templates</h1>
        <Button asChild>
          <Link href="/dashboard/templates/new">
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Plus className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No templates yet</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            Create your first WordPress template to get started. Templates define the structure and layout of different pages in your WordPress site.
          </p>
          <Button asChild>
            <Link href="/dashboard/templates/new">Create Your First Template</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              componentsCount={template.components.length} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
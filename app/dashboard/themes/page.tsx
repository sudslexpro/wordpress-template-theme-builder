import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import ThemeCard from '@/components/themes/theme-card';

export default async function ThemesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const themes = await prisma.theme.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      templates: {
        select: {
          id: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Themes</h1>
        <Button asChild>
          <Link href="/dashboard/themes/new">
            <Plus className="mr-2 h-4 w-4" /> Create Theme
          </Link>
        </Button>
      </div>

      {themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Plus className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No themes yet</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            Create your first WordPress theme to get started. You can customize it with templates and components.
          </p>
          <Button asChild>
            <Link href="/dashboard/themes/new">Create Your First Theme</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <ThemeCard 
              key={theme.id} 
              theme={theme} 
              templatesCount={theme.templates.length} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
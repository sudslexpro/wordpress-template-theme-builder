import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import WordPressSiteCard from '@/components/wordpress-sites/wordpress-site-card';

export default async function WordPressSitesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const wordpressSites = await prisma.wordPressSite.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">WordPress Sites</h1>
          <p className="text-muted-foreground">
            Manage your connected WordPress sites for theme and template deployment
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/wordpress-sites/new">
            <Plus className="mr-2 h-4 w-4" /> Connect Site
          </Link>
        </Button>
      </div>

      {wordpressSites.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
          <h3 className="text-lg font-medium">No WordPress sites connected yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your first WordPress site to deploy themes and templates
          </p>
          <Button asChild>
            <Link href="/dashboard/wordpress-sites/new">
              Connect WordPress Site
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wordpressSites.map((site) => (
            <WordPressSiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
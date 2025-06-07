import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import DeploymentsList from '@/components/deployments/deployments-list';

interface DeploymentsPageProps {
  searchParams: {
    siteId?: string;
    status?: string;
    type?: string;
  };
}

export default async function DeploymentsPage({ searchParams }: DeploymentsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Build filter based on search params
  const filter: any = {
    userId: session.user.id,
  };

  if (searchParams.siteId) {
    filter.wordPressSiteId = searchParams.siteId;
  }

  if (searchParams.status) {
    filter.status = searchParams.status;
  }

  if (searchParams.type === 'theme') {
    filter.themeId = { not: null };
    filter.templateId = null;
  } else if (searchParams.type === 'template') {
    filter.templateId = { not: null };
    filter.themeId = null;
  }

  const deployments = await prisma.deployment.findMany({
    where: filter,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      wordPressSite: true,
      theme: true,
      template: true,
    },
  });

  // Get WordPress sites for filter dropdown
  const wordPressSites = await prisma.wordPressSite.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Deployments</h1>
          <p className="text-muted-foreground">
            Manage your theme and template deployments to WordPress sites
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/deployments/new">
            <Plus className="mr-2 h-4 w-4" /> New Deployment
          </Link>
        </Button>
      </div>

      <DeploymentsList 
        initialDeployments={deployments} 
        wordPressSites={wordPressSites}
        initialFilters={{
          siteId: searchParams.siteId || '',
          status: searchParams.status || '',
          type: searchParams.type || '',
        }}
      />
    </div>
  );
}
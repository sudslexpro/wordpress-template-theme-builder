import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DashboardStats from '@/components/dashboard/dashboard-stats';
import RecentActivity from '@/components/dashboard/recent-activity';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get counts for dashboard stats
  const themesCount = await prisma.theme.count({
    where: { userId: session.user.id },
  });

  const templatesCount = await prisma.template.count({
    where: { userId: session.user.id },
  });

  const wordpressSitesCount = await prisma.wordPressSite.count({
    where: { userId: session.user.id },
  });

  const deploymentsCount = await prisma.deployment.count({
    where: {
      wordpressSite: {
        userId: session.user.id,
      },
    },
  });

  // Get recent deployments
  const recentDeployments = await prisma.deployment.findMany({
    where: {
      wordpressSite: {
        userId: session.user.id,
      },
    },
    include: {
      wordpressSite: true,
      theme: true,
      template: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <DashboardStats
        themesCount={themesCount}
        templatesCount={templatesCount}
        wordpressSitesCount={wordpressSitesCount}
        deploymentsCount={deploymentsCount}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <RecentActivity deployments={recentDeployments} />
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <a
              href="/dashboard/themes/new"
              className="block p-4 bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
            >
              <h3 className="font-medium">Create New Theme</h3>
              <p className="text-sm text-muted-foreground">
                Start building a new WordPress theme from scratch
              </p>
            </a>
            <a
              href="/dashboard/templates/new"
              className="block p-4 bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
            >
              <h3 className="font-medium">Create New Template</h3>
              <p className="text-sm text-muted-foreground">
                Design a new template for your WordPress site
              </p>
            </a>
            <a
              href="/dashboard/wordpress-sites/new"
              className="block p-4 bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
            >
              <h3 className="font-medium">Connect WordPress Site</h3>
              <p className="text-sm text-muted-foreground">
                Connect to a WordPress site for deployment
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
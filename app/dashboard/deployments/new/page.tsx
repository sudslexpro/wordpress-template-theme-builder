import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NewDeploymentForm from '@/components/deployments/new-deployment-form';

export default async function NewDeploymentPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return notFound();
  }

  // Get all WordPress sites for the user
  const wordPressSites = await prisma.wordPressSite.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Get all themes for the user
  const themes = await prisma.theme.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Get all templates for the user
  const templates = await prisma.template.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      theme: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // If there are no WordPress sites, redirect to the WordPress sites page
  if (wordPressSites.length === 0) {
    redirect('/dashboard/wordpress-sites');
  }

  // If there are no themes or templates, redirect to the themes page
  if (themes.length === 0 && templates.length === 0) {
    redirect('/dashboard/themes');
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/deployments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          New Deployment
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Deployment</CardTitle>
          <CardDescription>
            Deploy a theme or template to a WordPress site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewDeploymentForm 
            wordPressSites={wordPressSites} 
            themes={themes} 
            templates={templates} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
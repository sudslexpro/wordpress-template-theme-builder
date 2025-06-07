import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Edit, RefreshCw, Globe, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SiteDeployments from '@/components/wordpress-sites/site-deployments';
import SiteSettings from '@/components/wordpress-sites/site-settings';

interface WordPressSitePageProps {
  params: {
    id: string;
  };
}

export default async function WordPressSitePage({ params }: WordPressSitePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const site = await prisma.wordPressSite.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!site) {
    notFound();
  }

  // Get recent deployments for this site
  const deployments = await prisma.deployment.findMany({
    where: {
      wordPressSiteId: site.id,
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
    include: {
      theme: true,
      template: true,
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Disconnected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/wordpress-sites">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{site.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/wordpress-sites/${site.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/deployments/new?siteId=${site.id}`}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Deploy
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={site.url} target="_blank" rel="noopener noreferrer">
              <Globe className="mr-2 h-4 w-4" />
              Visit Site
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>Details about this WordPress site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">URL</h3>
              <p className="text-sm text-muted-foreground">
                <a 
                  href={site.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline text-primary"
                >
                  {site.url}
                </a>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">API URL</h3>
              <p className="text-sm text-muted-foreground">{site.apiUrl}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Username</h3>
              <p className="text-sm text-muted-foreground">{site.username}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Status</h3>
              <div className="flex items-center gap-2">
                {getStatusBadge(site.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Additional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Created</h3>
              <p className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(site.createdAt), 'PPP')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Last Updated</h3>
              <p className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(site.updatedAt), 'PPP')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Last Sync</h3>
              <p className="text-sm text-muted-foreground">
                {site.lastSync ? format(new Date(site.lastSync), 'PPP') : 'Never'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Recent Deployments</h3>
              <p className="text-sm text-muted-foreground">
                {deployments.length} deployment{deployments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deployments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="deployments" className="space-y-6">
          <SiteDeployments siteId={site.id} initialDeployments={deployments} />
        </TabsContent>
        <TabsContent value="settings" className="space-y-6">
          <SiteSettings site={site} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
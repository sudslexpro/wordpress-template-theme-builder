import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeploymentLogs from '@/components/deployments/deployment-logs';
import DeploymentFiles from '@/components/deployments/deployment-files';

export default async function DeploymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return notFound();
  }

  const deployment = await prisma.deployment.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      wordPressSite: true,
      theme: true,
      template: true,
    },
  });

  if (!deployment) {
    return notFound();
  }

  // Get deployment logs
  const logs = await prisma.deploymentLog.findMany({
    where: {
      deploymentId: deployment.id,
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  // Get deployment files
  const files = await prisma.deploymentFile.findMany({
    where: {
      deploymentId: deployment.id,
    },
    orderBy: {
      path: 'asc',
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDeploymentType = () => {
    if (deployment.themeId) {
      return 'Theme';
    } else if (deployment.templateId) {
      return 'Template';
    } else {
      return 'Unknown';
    }
  };

  const getDeploymentName = () => {
    if (deployment.theme) {
      return deployment.theme.name;
    } else if (deployment.template) {
      return deployment.template.name;
    } else {
      return deployment.name || 'Unnamed';
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/deployments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Deployment Details
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={deployment.wordPressSite.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Site
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/api/deployments/${deployment.id}/redeploy`} prefetch={false}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Redeploy
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deployment Information</CardTitle>
            <CardDescription>
              Details about this deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1">{getStatusBadge(deployment.status)}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                <dd className="mt-1">{getDeploymentType()}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="mt-1">{getDeploymentName()}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">WordPress Site</dt>
                <dd className="mt-1">
                  <Link 
                    href={`/dashboard/wordpress-sites/${deployment.wordPressSite.id}`}
                    className="hover:underline text-primary"
                  >
                    {deployment.wordPressSite.name}
                  </Link>
                </dd>
              </div>
              {deployment.theme && (
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Theme</dt>
                  <dd className="mt-1">
                    <Link 
                      href={`/dashboard/themes/${deployment.theme.id}`}
                      className="hover:underline text-primary"
                    >
                      {deployment.theme.name}
                    </Link>
                  </dd>
                </div>
              )}
              {deployment.template && (
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Template</dt>
                  <dd className="mt-1">
                    <Link 
                      href={`/dashboard/templates/${deployment.template.id}`}
                      className="hover:underline text-primary"
                    >
                      {deployment.template.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Metadata</CardTitle>
            <CardDescription>
              Technical details about this deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Deployment ID</dt>
                <dd className="mt-1 font-mono text-sm">{deployment.id}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                <dd className="mt-1">{format(new Date(deployment.createdAt), 'PPpp')}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Updated At</dt>
                <dd className="mt-1">{format(new Date(deployment.updatedAt), 'PPpp')}</dd>
              </div>
              {deployment.completedAt && (
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Completed At</dt>
                  <dd className="mt-1">{format(new Date(deployment.completedAt), 'PPpp')}</dd>
                </div>
              )}
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Files Count</dt>
                <dd className="mt-1">{files.length}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Logs Count</dt>
                <dd className="mt-1">{logs.length}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList>
          <TabsTrigger value="logs">Deployment Logs</TabsTrigger>
          <TabsTrigger value="files">Deployed Files</TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="mt-4">
          <DeploymentLogs logs={logs} />
        </TabsContent>
        <TabsContent value="files" className="mt-4">
          <DeploymentFiles files={files} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
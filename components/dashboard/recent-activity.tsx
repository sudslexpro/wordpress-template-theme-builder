import { formatDistanceToNow } from 'date-fns';
import { Deployment } from '@prisma/client';
import { Badge } from '@/components/ui/badge';

interface RecentActivityProps {
  deployments: Array<
    Deployment & {
      wordpressSite: { name: string };
      theme?: { name: string } | null;
      template?: { name: string } | null;
    }
  >;
}

export default function RecentActivity({ deployments }: RecentActivityProps) {
  if (deployments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deployments.map((deployment) => {
        const deploymentType = deployment.themeId ? 'Theme' : 'Template';
        const deploymentName = deployment.themeId
          ? deployment.theme?.name
          : deployment.template?.name;

        return (
          <div
            key={deployment.id}
            className="border-b border-border pb-4 last:border-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {deploymentType}: {deploymentName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Deployed to {deployment.wordpressSite.name}
                </p>
              </div>
              <Badge
                variant={getStatusVariant(deployment.status)}
                className="ml-2"
              >
                {deployment.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(deployment.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function getStatusVariant(status: string): 'default' | 'success' | 'destructive' | 'outline' | 'secondary' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
      return 'destructive';
    case 'PENDING':
      return 'secondary';
    case 'IN_PROGRESS':
      return 'outline';
    default:
      return 'default';
  }
}
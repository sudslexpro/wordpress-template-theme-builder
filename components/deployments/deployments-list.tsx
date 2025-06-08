'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { Deployment, WordPressSite, Theme, Template } from '@prisma/client';
import { MoreHorizontal, Eye, RefreshCw, Trash2, Palette, FileCode } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type DeploymentWithRelations = Deployment & {
  wordPressSite: WordPressSite;
  theme?: Theme | null;
  template?: Template | null;
};

interface WordPressSiteOption {
  id: string;
  name: string;
}

interface DeploymentsListProps {
  initialDeployments: DeploymentWithRelations[];
  wordPressSites: WordPressSiteOption[];
  initialFilters: {
    siteId: string;
    status: string;
    type: string;
  };
}

export default function DeploymentsList({ 
  initialDeployments, 
  wordPressSites,
  initialFilters 
}: DeploymentsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [deployments, setDeployments] = useState<DeploymentWithRelations[]>(initialDeployments);
  const [filteredDeployments, setFilteredDeployments] = useState<DeploymentWithRelations[]>(initialDeployments);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deploymentToDelete, setDeploymentToDelete] = useState<Deployment | null>(null);
  const [isRedeploying, setIsRedeploying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...deployments];

    if (filters.siteId) {
      filtered = filtered.filter(d => d.wordPressSiteId === filters.siteId);
    }

    if (filters.status) {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    if (filters.type === 'theme') {
      filtered = filtered.filter(d => d.themeId !== null);
    } else if (filters.type === 'template') {
      filtered = filtered.filter(d => d.templateId !== null);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => {
        return (
          d.name?.toLowerCase().includes(term) ||
          d.wordPressSite.name.toLowerCase().includes(term) ||
          d.theme?.name.toLowerCase().includes(term) ||
          d.template?.name.toLowerCase().includes(term)
        );
      });
    }

    setFilteredDeployments(filtered);
  }, [deployments, filters, searchTerm]);

  const handleDelete = async () => {
    if (!deploymentToDelete) return;

    try {
      const response = await fetch(`/api/deployments/${deploymentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deployment');
      }

      setDeployments(deployments.filter(d => d.id !== deploymentToDelete.id));
      toast.success('Deployment deleted successfully');
    } catch (error) {
      console.error('Error deleting deployment:', error);
      toast.error('Failed to delete deployment');
    } finally {
      setIsDeleteDialogOpen(false);
      setDeploymentToDelete(null);
    }
  };

  const handleRedeploy = async (deployment: DeploymentWithRelations) => {
    setIsRedeploying(deployment.id);

    try {
      const response = await fetch(`/api/deployments/${deployment.id}/redeploy`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to redeploy');
      }

      const newDeployment = await response.json();
      
      // Add the new deployment to the list and refresh
      toast.success('Redeployment initiated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error redeploying:', error);
      toast.error('Failed to redeploy');
    } finally {
      setIsRedeploying(null);
    }
  };

  const openDeleteDialog = (deployment: Deployment) => {
    setDeploymentToDelete(deployment);
    setIsDeleteDialogOpen(true);
  };

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

  const getDeploymentType = (deployment: DeploymentWithRelations) => {
    if (deployment.theme) {
      return (
        <div className="flex items-center gap-1">
          <Palette className="h-4 w-4 text-primary" />
          <span>Theme</span>
        </div>
      );
    } else if (deployment.template) {
      return (
        <div className="flex items-center gap-1">
          <FileCode className="h-4 w-4 text-primary" />
          <span>Template</span>
        </div>
      );
    } else {
      return 'Unknown';
    }
  };

  const getDeploymentName = (deployment: DeploymentWithRelations) => {
    if (deployment.theme) {
      return (
        <Link 
          href={`/dashboard/themes/${deployment.theme.id}`}
          className="hover:underline text-primary"
        >
          {deployment.theme.name}
        </Link>
      );
    } else if (deployment.template) {
      return (
        <Link 
          href={`/dashboard/templates/${deployment.template.id}`}
          className="hover:underline text-primary"
        >
          {deployment.template.name}
        </Link>
      );
    } else {
      return deployment.name || 'Unnamed';
    }
  };

  const updateFilters = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL query params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    
    router.push(`/dashboard/deployments?${params.toString()}`);
  };

  if (filteredDeployments.length === 0) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search deployments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-2">
            <Select
              value={filters.siteId}
              onValueChange={(value) => updateFilters('siteId', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sites</SelectItem>
                {wordPressSites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilters('status', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => updateFilters('type', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="theme">Theme</SelectItem>
                <SelectItem value="template">Template</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
          <h3 className="text-lg font-medium">No deployments found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || filters.siteId || filters.status || filters.type
              ? 'Try adjusting your filters or search term'
              : 'Deploy a theme or template to a WordPress site'}
          </p>
          <Button asChild>
            <Link href="/dashboard/deployments/new">
              Create Deployment
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search deployments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.siteId}
            onValueChange={(value) => updateFilters('siteId', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sites</SelectItem>
              {wordPressSites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilters('status', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.type}
            onValueChange={(value) => updateFilters('type', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="theme">Theme</SelectItem>
              <SelectItem value="template">Template</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>WordPress Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deployed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeployments.map((deployment) => (
              <TableRow key={deployment.id}>
                <TableCell>{getDeploymentType(deployment)}</TableCell>
                <TableCell>{getDeploymentName(deployment)}</TableCell>
                <TableCell>
                  <Link 
                    href={`/dashboard/wordpress-sites/${deployment.wordPressSite.id}`}
                    className="hover:underline text-primary"
                  >
                    {deployment.wordPressSite.name}
                  </Link>
                </TableCell>
                <TableCell>{getStatusBadge(deployment.status)}</TableCell>
                <TableCell>
                  <span title={format(new Date(deployment.createdAt), 'PPpp')}>
                    {formatDistanceToNow(new Date(deployment.createdAt), { addSuffix: true })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/deployments/${deployment.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRedeploy(deployment)}
                        disabled={isRedeploying === deployment.id}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isRedeploying === deployment.id ? 'animate-spin' : ''}`} />
                        Redeploy
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => openDeleteDialog(deployment)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this deployment record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
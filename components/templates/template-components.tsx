'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Component } from '@prisma/client';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Eye, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

interface TemplateComponentsProps {
  templateId: string;
  components: Component[];
}

export default function TemplateComponents({ templateId, components }: TemplateComponentsProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<Component | null>(null);

  const handleDelete = async () => {
    if (!componentToDelete) return;

    try {
      const response = await fetch(`/api/components/${componentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete component');
      }

      toast.success('Component deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting component:', error);
      toast.error('Failed to delete component');
    } finally {
      setIsDeleteDialogOpen(false);
      setComponentToDelete(null);
    }
  };

  const openDeleteDialog = (component: Component) => {
    setComponentToDelete(component);
    setIsDeleteDialogOpen(true);
  };

  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-lg font-medium">No components yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add your first component to this template
        </p>
        <Button asChild>
          <Link href={`/dashboard/components/new?templateId=${templateId}`}>
            Add Component
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {components.map((component) => (
          <Card key={component.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{component.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {component.selector}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/components/${component.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/components/${component.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/api/components/${component.id}/export`}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => openDeleteDialog(component)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-sm">
                <p className="text-muted-foreground">
                  {component.description || 'No description provided'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex justify-between w-full text-xs text-muted-foreground">
                <span>Type: {component.type}</span>
                <span>Updated {format(new Date(component.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the component &quot;{componentToDelete?.name}&quot;. This action cannot be undone.
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
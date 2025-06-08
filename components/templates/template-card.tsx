'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Template } from '@prisma/client';
import { MoreHorizontal, Download, Trash2, Edit, Palette } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { toast } from '@/components/ui/use-toast';

interface TemplateCardProps {
  template: Template & {
    theme: {
      id: string;
      name: string;
    };
  };
  componentsCount: number;
}

export default function TemplateCard({ template, componentsCount }: TemplateCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      toast({
        title: 'Template deleted',
        description: `${template.name} has been deleted successfully.`,
      });

      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/templates/${template.id}/export`);
      
      if (!response.ok) {
        throw new Error('Failed to export template');
      }
      
      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${template.name.toLowerCase().replace(/\s+/g, '-')}.php`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Template exported',
        description: `${template.name} has been exported successfully.`,
      });
    } catch (error) {
      console.error('Error exporting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to export template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="bg-primary/5 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/templates/${template.id}`}>
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/templates/${template.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/templates/${template.id}/preview`}>
                    Preview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">
            {template.description || 'No description provided'}
          </p>
          <div className="flex items-center mt-4 text-sm">
            <Badge variant="outline" className="capitalize">
              {template.type.toLowerCase()}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-sm">
              <span className="mr-1">{componentsCount}</span>
              <span>{componentsCount === 1 ? 'Component' : 'Components'}</span>
            </div>
            <Link 
              href={`/dashboard/themes/${template.theme.id}`}
              className="flex items-center text-sm text-primary hover:underline"
            >
              <Palette className="h-4 w-4 mr-1" />
              {template.theme.name}
            </Link>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 py-2 px-6 text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{template.name}" and all associated components.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
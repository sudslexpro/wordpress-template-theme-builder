import { Template, Theme } from '@prisma/client';
import { format } from 'date-fns';
import { FileCode, Calendar, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TemplateDetailsProps {
  template: Template & {
    theme: Theme;
  };
}

export default function TemplateDetails({ template }: TemplateDetailsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
          <CardDescription>Basic details about this template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Name</h3>
            <p className="text-sm text-muted-foreground">{template.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">{template.description || 'No description provided'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Type</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <FileCode className="h-3 w-3 mr-1" />
                {template.type}
              </Badge>
              {template.customType && (
                <Badge variant="secondary">{template.customType}</Badge>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground">{template.theme.name}</p>
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
              {format(new Date(template.createdAt), 'PPP')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Last Updated</h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {format(new Date(template.updatedAt), 'PPP')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Component Count</h3>
            <p className="text-sm text-muted-foreground">
              {template.components?.length || 0} component{template.components?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Initial Content</h3>
            <p className="text-sm text-muted-foreground">
              {template.initialContent ? 'Yes' : 'No'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
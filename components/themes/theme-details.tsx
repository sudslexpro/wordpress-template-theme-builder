import { formatDistanceToNow } from 'date-fns';
import { Theme } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ThemeDetailsProps {
  theme: Theme;
}

export default function ThemeDetails({ theme }: ThemeDetailsProps) {
  // Parse tags if they exist
  const tags = theme.tags ? theme.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Information</CardTitle>
          <CardDescription>
            Details about your WordPress theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="text-base">{theme.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-base">{theme.description || 'No description provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Version</h3>
                <p className="text-base">{theme.version}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Author</h3>
                <p className="text-base">{theme.author || 'Not specified'}</p>
              </div>
              
              {theme.authorUri && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Author URI</h3>
                  <a 
                    href={theme.authorUri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-base text-primary hover:underline"
                  >
                    {theme.authorUri}
                  </a>
                </div>
              )}
              
              {theme.themeUri && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Theme URI</h3>
                  <a 
                    href={theme.themeUri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-base text-primary hover:underline"
                  >
                    {theme.themeUri}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span>Created: </span>
              <span>{formatDistanceToNow(new Date(theme.createdAt), { addSuffix: true })}</span>
            </div>
            <div>
              <span>Last updated: </span>
              <span>{formatDistanceToNow(new Date(theme.updatedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
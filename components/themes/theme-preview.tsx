'use client';

import { useState } from 'react';
import { Theme, Template, Component } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface ThemePreviewProps {
  theme: Theme & {
    templates: Array<Template & { components: Component[] }>;
  };
}

export default function ThemePreview({ theme }: ThemePreviewProps) {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(
    theme.templates.length > 0 ? theme.templates[0].id : null
  );

  // Get template types for preview tabs
  const templateTypes = Array.from(
    new Set(theme.templates.map((template) => template.type))
  );

  // Group templates by type
  const templatesByType = templateTypes.reduce<Record<string, Array<Template & { components: Component[] }>>>(
    (acc, type) => {
      acc[type] = theme.templates.filter((template) => template.type === type);
      return acc;
    },
    {}
  );

  if (theme.templates.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No templates available</AlertTitle>
        <AlertDescription>
          This theme doesn't have any templates yet. Add templates to see a preview.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
          <CardDescription>
            Preview how your theme will look with different templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={templateTypes[0]} className="w-full">
            <TabsList className="mb-6">
              {templateTypes.map((type) => (
                <TabsTrigger key={type} value={type} className="capitalize">
                  {type.toLowerCase()}
                </TabsTrigger>
              ))}
            </TabsList>

            {templateTypes.map((type) => (
              <TabsContent key={type} value={type} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/4 space-y-2">
                    <h3 className="text-sm font-medium">Templates</h3>
                    <div className="space-y-1">
                      {templatesByType[type].map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setActiveTemplate(template.id)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeTemplate === template.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-3/4">
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted p-2 border-b flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <div className="ml-2 text-xs text-muted-foreground truncate">
                          {activeTemplate && theme.templates.find(t => t.id === activeTemplate)?.name}
                        </div>
                      </div>
                      <div className="bg-background p-4 h-[500px] overflow-auto">
                        {activeTemplate && (
                          <TemplatePreview 
                            template={theme.templates.find(t => t.id === activeTemplate)!} 
                            theme={theme} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface TemplatePreviewProps {
  template: Template & { components: Component[] };
  theme: Theme;
}

function TemplatePreview({ template, theme }: TemplatePreviewProps) {
  // This is a simplified preview - in a real application, you would render
  // a more accurate representation of the WordPress template
  return (
    <div className="space-y-6">
      <header className="pb-4 border-b">
        <h1 className="text-2xl font-bold">{theme.name}</h1>
        <nav className="mt-4">
          <ul className="flex space-x-4">
            <li className="text-primary font-medium">Home</li>
            <li>About</li>
            <li>Blog</li>
            <li>Contact</li>
          </ul>
        </nav>
      </header>

      <main className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="text-xl font-semibold mb-4">{template.name}</h2>
          <p className="text-muted-foreground mb-4">
            {template.description || 'This is a preview of how your template might look on a WordPress site.'}
          </p>

          {template.components.length > 0 ? (
            <div className="space-y-4">
              {template.components.map((component) => (
                <div key={component.id} className="border p-4 rounded-md">
                  <h3 className="font-medium">{component.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {component.description || 'Component description'}
                  </p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                    {`<!-- ${component.name} Component -->`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed p-6 rounded-md text-center text-muted-foreground">
              No components added to this template yet
            </div>
          )}
        </div>

        <div className="col-span-1">
          <div className="border p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2">Sidebar</h3>
            <div className="space-y-2">
              <div className="bg-muted h-8 rounded" />
              <div className="bg-muted h-24 rounded" />
              <div className="bg-muted h-40 rounded" />
            </div>
          </div>
        </div>
      </main>

      <footer className="pt-4 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {theme.name} - Created with WordPress Theme Builder</p>
      </footer>
    </div>
  );
}
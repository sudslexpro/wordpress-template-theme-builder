'use client';

import { useState } from 'react';
import { Component, Template, Theme } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TemplatePreviewProps {
  template: Template & {
    theme: Theme;
    components: Component[];
  };
}

export default function TemplatePreview({ template }: TemplatePreviewProps) {
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  // Group components by type for better organization
  const componentsByType = template.components.reduce<Record<string, Component[]>>(
    (acc, component) => {
      const type = component.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(component);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Preview</CardTitle>
          <CardDescription>
            A simplified preview of how this template might look when rendered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/4 space-y-4">
              <h3 className="text-sm font-medium">Components</h3>
              {Object.entries(componentsByType).length > 0 ? (
                <Tabs defaultValue={Object.keys(componentsByType)[0]} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    {Object.keys(componentsByType).map((type) => (
                      <TabsTrigger key={type} value={type}>
                        {type}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(componentsByType).map(([type, components]) => (
                    <TabsContent key={type} value={type} className="space-y-2">
                      {components.map((component) => (
                        <div
                          key={component.id}
                          className={`p-2 border rounded-md cursor-pointer hover:bg-accent ${selectedComponent?.id === component.id ? 'bg-accent' : ''}`}
                          onClick={() => setSelectedComponent(component)}
                        >
                          <p className="text-sm font-medium">{component.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {component.selector}
                          </p>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <p className="text-sm text-muted-foreground">No components added yet</p>
              )}
            </div>

            <div className="w-full md:w-3/4 border rounded-md p-4">
              <div className="border-b pb-4 mb-4">
                <div className="bg-muted p-2 rounded-md mb-2">
                  <p className="text-sm font-medium">Header</p>
                  <p className="text-xs text-muted-foreground">
                    Theme: {template.theme.name}
                  </p>
                </div>
              </div>

              <div className="min-h-[300px] border-b pb-4 mb-4">
                <div className="bg-muted/50 p-4 rounded-md h-full flex flex-col items-center justify-center">
                  <h2 className="text-xl font-bold mb-2">{template.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description || 'No description provided'}
                  </p>

                  {selectedComponent ? (
                    <div className="w-full max-w-md border p-4 rounded-md bg-background">
                      <h3 className="text-sm font-medium mb-2">{selectedComponent.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {selectedComponent.description || 'No description provided'}
                      </p>
                      <div className="bg-muted p-2 rounded-md">
                        <p className="text-xs font-mono">{selectedComponent.selector}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a component to preview
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-2/3">
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-sm font-medium">Main Content</p>
                    <p className="text-xs text-muted-foreground">
                      Template Type: {template.type}
                      {template.customType && ` (${template.customType})`}
                    </p>
                  </div>
                </div>
                <div className="w-1/3">
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-sm font-medium">Sidebar</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-sm font-medium">Footer</p>
                  <p className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} {template.theme.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
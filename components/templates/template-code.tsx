'use client';

import { useState } from 'react';
import { Component, Template, Theme } from '@prisma/client';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TemplateCodeProps {
  template: Template & {
    theme: Theme;
    components: Component[];
  };
}

export default function TemplateCode({ template }: TemplateCodeProps) {
  const [copied, setCopied] = useState(false);

  // Generate PHP code for the template
  const generateTemplateCode = () => {
    const { name, type, customType } = template;
    const templateType = customType || type;
    
    // Basic template structure
    return `<?php
/**
 * Template Name: ${name}
 * Template Type: ${templateType}
 */

get_header();

// Start the Loop
while ( have_posts() ) :
    the_post();
    
    // Content
    the_content();
    
    // If comments are open or we have at least one comment, load up the comment template.
    if ( comments_open() || get_comments_number() ) :
        comments_template();
    endif;
    
endwhile;

${generateComponentsCode(template.components)}

get_footer();
`;
  };

  // Generate component code snippets
  const generateComponentsCode = (components: Component[]) => {
    if (components.length === 0) {
      return '// No components defined for this template';
    }

    return components.map(component => {
      return `
// Component: ${component.name}
// Selector: ${component.selector}
${component.content || '// No content defined for this component'}
`;
    }).join('\n');
  };

  // Generate CSS code
  const generateCssCode = () => {
    const { name, components } = template;
    
    return `/**
 * Styles for ${name} template
 */

/* Base template styles */
.${name.toLowerCase().replace(/\s+/g, '-')}-template {
  display: block;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Component styles */
${components.map(component => {
  return `
/* ${component.name} */
${component.selector} {
  display: block;
  margin-bottom: 1.5rem;
}
`;
}).join('')}
`;
  };

  // Generate JavaScript code
  const generateJsCode = () => {
    const { name, components } = template;
    
    return `/**
 * JavaScript for ${name} template
 */

(function($) {
  'use strict';
  
  // When the DOM is fully loaded
  $(document).ready(function() {
    // Template initialization
    console.log('${name} template initialized');
    
    ${components.map(component => {
      return `
    // ${component.name} functionality
    $('${component.selector}').each(function() {
      // Component initialization
      console.log('${component.name} component initialized');
    });
`;
    }).join('')}
  });
  
})(jQuery);
`;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const phpCode = generateTemplateCode();
  const cssCode = generateCssCode();
  const jsCode = generateJsCode();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Code</CardTitle>
          <CardDescription>
            Generated code for this template based on its configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="php" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="php">PHP</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
            </TabsList>
            
            <TabsContent value="php" className="space-y-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 z-10"
                  onClick={() => handleCopyCode(phpCode)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy code</span>
                </Button>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  <code>{phpCode}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="css" className="space-y-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 z-10"
                  onClick={() => handleCopyCode(cssCode)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy code</span>
                </Button>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  <code>{cssCode}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="js" className="space-y-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 z-10"
                  onClick={() => handleCopyCode(jsCode)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy code</span>
                </Button>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  <code>{jsCode}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
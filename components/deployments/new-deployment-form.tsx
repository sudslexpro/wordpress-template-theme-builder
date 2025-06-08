'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Theme, Template, WordPressSite } from '@prisma/client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface TemplateWithTheme extends Template {
  theme: Theme | null;
}

interface NewDeploymentFormProps {
  wordPressSites: WordPressSite[];
  themes: Theme[];
  templates: TemplateWithTheme[];
}

const formSchema = z.object({
  deploymentType: z.enum(['theme', 'template']),
  wordPressSiteId: z.string({
    required_error: 'Please select a WordPress site',
  }),
  themeId: z.string().optional(),
  templateId: z.string().optional(),
  includeComponents: z.boolean().default(true),
  includeAssets: z.boolean().default(true),
  activateAfterDeployment: z.boolean().default(false),
}).refine(data => {
  if (data.deploymentType === 'theme') {
    return !!data.themeId;
  } else {
    return !!data.templateId;
  }
}, {
  message: 'Please select a theme or template to deploy',
  path: ['themeId', 'templateId'],
});

type FormValues = z.infer<typeof formSchema>;

export default function NewDeploymentForm({ 
  wordPressSites, 
  themes, 
  templates 
}: NewDeploymentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deploymentType: 'theme',
      includeComponents: true,
      includeAssets: true,
      activateAfterDeployment: false,
    },
  });

  const deploymentType = form.watch('deploymentType');

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create deployment');
      }

      const data = await response.json();
      toast.success('Deployment created successfully');
      router.push(`/dashboard/deployments/${data.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating deployment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create deployment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="deploymentType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Deployment Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="theme" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Theme
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="template" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Template
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wordPressSiteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WordPress Site</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a WordPress site" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {wordPressSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The WordPress site where the theme or template will be deployed
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {deploymentType === 'theme' && (
          <FormField
            control={form.control}
            name="themeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The theme to deploy to the WordPress site
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {deploymentType === 'template' && (
          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} {template.theme && `(${template.theme.name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The template to deploy to the WordPress site
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Deployment Options</h3>
          
          <FormField
            control={form.control}
            name="includeComponents"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Include Components
                  </FormLabel>
                  <FormDescription>
                    Deploy all associated components with the theme or template
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="includeAssets"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Include Assets
                  </FormLabel>
                  <FormDescription>
                    Deploy all associated assets (CSS, JavaScript, images) with the theme or template
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activateAfterDeployment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Activate After Deployment
                  </FormLabel>
                  <FormDescription>
                    {deploymentType === 'theme' 
                      ? 'Activate the theme after deployment' 
                      : 'Apply the template after deployment'}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Deployment...' : 'Create Deployment'}
        </Button>
      </form>
    </Form>
  );
}
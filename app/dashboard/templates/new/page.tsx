'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Template name must be at least 3 characters.',
  }),
  description: z.string().optional(),
  type: z.enum(['PAGE', 'SINGLE', 'ARCHIVE', 'HOME', 'SEARCH', '404', 'CUSTOM']),
  customType: z.string().optional(),
  themeId: z.string().min(1, {
    message: 'Please select a theme.',
  }),
  content: z.string().optional(),
});

export default function NewTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [themes, setThemes] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);

  // Get themeId from query params if available
  const themeIdFromQuery = searchParams.get('themeId');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'PAGE',
      customType: '',
      themeId: themeIdFromQuery || '',
      content: '',
    },
  });

  // Watch the type field to conditionally show custom type input
  const templateType = form.watch('type');

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch('/api/themes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch themes');
        }
        
        const data = await response.json();
        setThemes(data);
      } catch (error) {
        console.error('Error fetching themes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load themes. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingThemes(false);
      }
    };

    fetchThemes();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // If type is CUSTOM, ensure customType is provided
    if (values.type === 'CUSTOM' && (!values.customType || values.customType.trim() === '')) {
      form.setError('customType', {
        type: 'manual',
        message: 'Custom template type is required',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare the data to send
      const templateData = {
        ...values,
        // If type is CUSTOM, use the customType value
        type: values.type === 'CUSTOM' ? values.customType : values.type,
      };

      // Remove customType as it's not part of the API schema
      delete templateData.customType;

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create template');
      }

      const template = await response.json();

      toast({
        title: 'Template created',
        description: `${values.name} has been created successfully.`,
      });

      router.push(`/dashboard/templates/${template.id}`);
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create template',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Template</h1>
        <p className="text-muted-foreground mt-2">
          Create a new WordPress template that defines the structure and layout of a specific page type.
        </p>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="themeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select
                    disabled={isLoadingThemes}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                    The theme this template belongs to.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Page Template" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your template.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of this template"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what this template is used for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PAGE">Page</SelectItem>
                      <SelectItem value="SINGLE">Single Post</SelectItem>
                      <SelectItem value="ARCHIVE">Archive</SelectItem>
                      <SelectItem value="HOME">Home</SelectItem>
                      <SelectItem value="SEARCH">Search</SelectItem>
                      <SelectItem value="404">404</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of WordPress template.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {templateType === 'CUSTOM' && (
              <FormField
                control={form.control}
                name="customType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Template Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., product, team-member" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify a custom template type (e.g., for custom post types).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Content (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add initial HTML/PHP content for this template"
                      className="min-h-[200px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can add initial HTML/PHP content for this template, or leave it blank to start from scratch.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Template
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
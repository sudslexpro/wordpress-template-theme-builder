'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Theme name must be at least 3 characters.',
  }),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  author: z.string().optional(),
  authorUri: z.string().url().optional().or(z.literal('')),
  themeUri: z.string().url().optional().or(z.literal('')),
  tags: z.string().optional(),
});

export default function NewThemePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      version: '1.0.0',
      author: '',
      authorUri: '',
      themeUri: '',
      tags: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create theme');
      }

      const theme = await response.json();

      toast({
        title: 'Theme created',
        description: `${values.name} has been created successfully.`,
      });

      router.push(`/dashboard/themes/${theme.id}`);
    } catch (error) {
      console.error('Error creating theme:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create theme',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Theme</h1>
        <p className="text-muted-foreground mt-2">
          Create a new WordPress theme that you can customize with templates and components.
        </p>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Theme" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the name of your WordPress theme.
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
                      placeholder="A brief description of your theme"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what your theme is about and what it's best used for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The version number of your theme.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The author of the theme.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="authorUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author URI</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      The author's website URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="themeUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme URI</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/theme" {...field} />
                    </FormControl>
                    <FormDescription>
                      The theme's website URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="blog, portfolio, e-commerce"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of tags for your theme.
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
                Create Theme
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
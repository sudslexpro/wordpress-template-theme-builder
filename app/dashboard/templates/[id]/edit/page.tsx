'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { Checkbox } from '@/components/ui/checkbox';

interface Theme {
  id: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  customType: string | null;
  themeId: string;
  initialContent: boolean;
}

const templateTypes = [
  'index',
  'single',
  'archive',
  'category',
  'tag',
  'author',
  'date',
  'search',
  '404',
  'attachment',
  'page',
  'custom',
];

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Template type is required'),
  customType: z.string().optional(),
  themeId: z.string().min(1, 'Theme is required'),
  initialContent: z.boolean().default(false),
});

interface EditTemplatePageProps {
  params: {
    id: string;
  };
}

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: '',
      customType: '',
      themeId: '',
      initialContent: false,
    },
  });

  const selectedType = form.watch('type');

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch('/api/themes');
        if (!response.ok) throw new Error('Failed to fetch themes');
        const data = await response.json();
        setThemes(data);
      } catch (error) {
        console.error('Error fetching themes:', error);
        toast.error('Failed to load themes');
      }
    };

    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch template');
        const data = await response.json();
        setTemplate(data);
        
        // Set form values
        form.reset({
          name: data.name,
          description: data.description || '',
          type: data.type,
          customType: data.customType || '',
          themeId: data.themeId,
          initialContent: data.initialContent || false,
        });
      } catch (error) {
        console.error('Error fetching template:', error);
        toast.error('Failed to load template');
      } finally {
        setIsFetching(false);
      }
    };

    fetchThemes();
    fetchTemplate();
  }, [params.id, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // If type is not custom, remove customType
      if (values.type !== 'custom') {
        values.customType = '';
      }

      const response = await fetch(`/api/templates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      toast.success('Template updated successfully');
      router.push(`/dashboard/templates/${params.id}`);
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">Template not found</h1>
        <Button asChild>
          <Link href="/dashboard/templates">Back to Templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/templates/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Template</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Template" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your template as it will appear in WordPress.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="themeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
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
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A brief description of this template"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional description to help identify this template.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templateTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of WordPress template.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === 'custom' && (
              <FormField
                control={form.control}
                name="customType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Type Name</FormLabel>
                    <FormControl>
                      <Input placeholder="product" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your custom template type (e.g., product, event).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name="initialContent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Include initial content
                  </FormLabel>
                  <FormDescription>
                    Add starter content to this template with common WordPress elements.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/templates/${params.id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Template
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
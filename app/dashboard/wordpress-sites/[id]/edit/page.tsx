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

interface WordPressSite {
  id: string;
  name: string;
  url: string;
  apiUrl: string;
  username: string;
}

const formSchema = z.object({
  name: z.string().min(1, 'Site name is required'),
  url: z.string().url('Must be a valid URL').min(1, 'Site URL is required'),
  apiUrl: z.string().url('Must be a valid URL').min(1, 'REST API URL is required'),
  username: z.string().min(1, 'Username is required'),
  applicationPassword: z.string().optional(),
});

interface EditWordPressSitePageProps {
  params: {
    id: string;
  };
}

export default function EditWordPressSitePage({ params }: EditWordPressSitePageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [site, setSite] = useState<WordPressSite | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      url: '',
      apiUrl: '',
      username: '',
      applicationPassword: '',
    },
  });

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await fetch(`/api/wordpress-sites/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch WordPress site');
        const data = await response.json();
        setSite(data);
        
        // Set form values
        form.reset({
          name: data.name,
          url: data.url,
          apiUrl: data.apiUrl,
          username: data.username,
          applicationPassword: '',
        });
      } catch (error) {
        console.error('Error fetching WordPress site:', error);
        toast.error('Failed to load WordPress site');
      } finally {
        setIsFetching(false);
      }
    };

    fetchSite();
  }, [params.id, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // If application password is empty, remove it from the request
      if (!values.applicationPassword) {
        const { applicationPassword, ...rest } = values;
        values = rest as z.infer<typeof formSchema>;
      }

      const response = await fetch(`/api/wordpress-sites/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update WordPress site');
      }

      toast.success('WordPress site updated successfully');
      router.push(`/dashboard/wordpress-sites/${params.id}`);
    } catch (error) {
      console.error('Error updating WordPress site:', error);
      toast.error('Failed to update WordPress site');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('url', url);
    
    // Auto-generate API URL based on the site URL
    if (url && url !== 'https://') {
      const apiUrl = `${url.replace(/\/$/, '')}/wp-json/wp/v2`;
      form.setValue('apiUrl', apiUrl);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold">WordPress site not found</h1>
        <Button asChild>
          <Link href="/dashboard/wordpress-sites">Back to WordPress Sites</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/wordpress-sites/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit WordPress Site</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site Name</FormLabel>
                <FormControl>
                  <Input placeholder="My WordPress Site" {...field} />
                </FormControl>
                <FormDescription>
                  A friendly name to identify this WordPress site.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com" 
                    {...field} 
                    onChange={handleUrlChange}
                  />
                </FormControl>
                <FormDescription>
                  The URL of your WordPress site.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>REST API URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/wp-json/wp/v2" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  The WordPress REST API endpoint. This is usually auto-generated based on your site URL.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="admin" {...field} />
                </FormControl>
                <FormDescription>
                  Your WordPress username with administrator privileges.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Password (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Leave blank to keep current password" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Only fill this if you want to update the application password. Leave blank to keep the current one.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/wordpress-sites/${params.id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Site
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
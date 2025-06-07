'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(1, 'Site name is required'),
  url: z.string().url('Must be a valid URL').min(1, 'Site URL is required'),
  apiUrl: z.string().url('Must be a valid URL').min(1, 'REST API URL is required'),
  username: z.string().min(1, 'Username is required'),
  applicationPassword: z.string().min(1, 'Application password is required'),
});

export default function NewWordPressSitePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      url: 'https://',
      apiUrl: 'https://example.com/wp-json/wp/v2',
      username: '',
      applicationPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/wordpress-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect WordPress site');
      }

      const data = await response.json();
      toast.success('WordPress site connected successfully');
      router.push(`/dashboard/wordpress-sites/${data.id}`);
    } catch (error) {
      console.error('Error connecting WordPress site:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect WordPress site');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    const values = form.getValues();
    const isValid = await form.trigger();
    
    if (!isValid) {
      return;
    }
    
    setIsTestingConnection(true);
    
    try {
      const response = await fetch('/api/wordpress-sites/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Connection test failed');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Successfully connected to WordPress site');
      } else {
        toast.error(`Connection failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to test connection');
    } finally {
      setIsTestingConnection(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/wordpress-sites">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Connect WordPress Site</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    <FormLabel>Application Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      An application password generated in your WordPress admin.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Connection
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Connect Site
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How to Connect Your WordPress Site</CardTitle>
            <CardDescription>
              Follow these steps to securely connect your WordPress site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">1. Install the Application Passwords Plugin</h3>
              <p className="text-sm text-muted-foreground">
                If you're using WordPress 5.6 or later, Application Passwords are built-in. Otherwise, install the Application Passwords plugin.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">2. Generate an Application Password</h3>
              <p className="text-sm text-muted-foreground">
                Go to your WordPress admin → Users → Profile → Application Passwords section. Enter "Theme Builder" as the name and click "Add New Application Password".
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">3. Copy the Generated Password</h3>
              <p className="text-sm text-muted-foreground">
                WordPress will generate a password. Copy it immediately (it will only be shown once) and paste it in the form.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">4. Test the Connection</h3>
              <p className="text-sm text-muted-foreground">
                Click "Test Connection" to verify your credentials before saving.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
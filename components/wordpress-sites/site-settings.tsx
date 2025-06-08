'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, RefreshCw } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface WordPressSite {
  id: string;
  name: string;
  url: string;
  apiUrl: string;
  username: string;
  status: string;
  lastSync: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SiteSettingsProps {
  site: WordPressSite;
}

const formSchema = z.object({
  autoSync: z.boolean().default(false),
  syncInterval: z.string().min(1, 'Sync interval is required'),
  notifyOnDeployment: z.boolean().default(true),
  notifyOnFailure: z.boolean().default(true),
});

export default function SiteSettings({ site }: SiteSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      autoSync: false,
      syncInterval: '24',
      notifyOnDeployment: true,
      notifyOnFailure: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/wordpress-sites/${site.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      toast.success('Settings updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      const response = await fetch(`/api/wordpress-sites/${site.id}/sync`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync site');
      }

      toast.success('Site synced successfully');
      router.refresh();
    } catch (error) {
      console.error('Error syncing site:', error);
      toast.error('Failed to sync site');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetPassword = async () => {
    setIsResettingPassword(true);
    
    try {
      const response = await fetch(`/api/wordpress-sites/${site.id}/reset-password`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset application password');
      }

      toast.success('Application password reset successfully');
      router.refresh();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset application password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sync Settings</CardTitle>
            <CardDescription>
              Configure how this WordPress site syncs with our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="autoSync"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Automatic Sync
                        </FormLabel>
                        <FormDescription>
                          Automatically sync with WordPress site on a schedule
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('autoSync') && (
                  <FormField
                    control={form.control}
                    name="syncInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sync Interval (hours)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="168" {...field} />
                        </FormControl>
                        <FormDescription>
                          How often to sync with WordPress (in hours)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSync}
                    disabled={isSyncing}
                  >
                    {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sync Now
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Settings
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure notifications for this WordPress site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="notifyOnDeployment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Deployment Notifications
                    </FormLabel>
                    <FormDescription>
                      Receive notifications when deployments complete
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifyOnFailure"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Failure Notifications
                    </FormLabel>
                    <FormDescription>
                      Receive notifications when deployments fail
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage authentication and security for this WordPress site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Application Password</h3>
            <p className="text-sm text-muted-foreground">
              The application password is securely stored and used to authenticate with your WordPress site.
              You can reset it if you need to generate a new one in WordPress.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleResetPassword}
            disabled={isResettingPassword}
          >
            {isResettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Application Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
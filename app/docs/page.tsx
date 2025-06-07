'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DocsPage() {
  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="mb-10">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-4">WordPress Template Theme Builder Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Learn how to use the WordPress Template Theme Builder to create, customize, and deploy WordPress themes and templates.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="usecases">Use Cases</TabsTrigger>
          <TabsTrigger value="getstarted">Get Started</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>
                Understanding the WordPress Template Theme Builder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The WordPress Template Theme Builder is a powerful application designed to streamline the process of creating, customizing, and deploying WordPress themes and templates. This tool bridges the gap between design and implementation, allowing developers and designers to build WordPress themes with an intuitive interface and deploy them directly to WordPress sites.
              </p>
              <p>
                Whether you're a developer looking to speed up your WordPress theme development workflow, a designer wanting to implement your designs without deep coding knowledge, or an agency managing multiple WordPress sites, this tool provides a comprehensive solution for WordPress theme and template management.
              </p>
              <p>
                The application follows a component-based approach to theme and template creation, allowing you to build modular, reusable elements that can be combined to create complex layouts and designs. This approach promotes consistency, reduces development time, and makes maintenance easier.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
              <CardDescription>
                Explore the capabilities of the WordPress Template Theme Builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Theme Builder</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Create complete WordPress themes with customizable styles</li>
                    <li>Modify existing themes with an intuitive interface</li>
                    <li>Export themes as standard WordPress theme packages</li>
                    <li>Manage theme dependencies and requirements</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Template Creator</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Build page templates for different content types</li>
                    <li>Design single post templates with custom layouts</li>
                    <li>Create archive templates for categories and tags</li>
                    <li>Develop specialized templates for specific needs</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">WordPress Integration</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Connect and manage multiple WordPress sites</li>
                    <li>Test connectivity to ensure proper deployment</li>
                    <li>Utilize WordPress REST API for communication</li>
                    <li>Secure credential management for site access</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">One-Click Deployment</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Deploy themes and templates with a single click</li>
                    <li>Track deployment progress and status in real-time</li>
                    <li>View detailed logs of deployment processes</li>
                    <li>Manage deployment history for all your sites</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usecases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Use Cases</CardTitle>
              <CardDescription>
                How different users can benefit from the WordPress Template Theme Builder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">For Developers</h3>
                <p className="mb-3">
                  WordPress developers can significantly speed up their workflow by using pre-built components and templates. Instead of coding everything from scratch, developers can:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Create reusable theme components that follow best practices</li>
                  <li>Generate clean, optimized PHP code automatically</li>
                  <li>Maintain consistency across multiple projects</li>
                  <li>Focus on custom functionality rather than boilerplate code</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">For Designers</h3>
                <p className="mb-3">
                  Designers who want to implement their WordPress designs without deep coding knowledge can:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Transform design concepts into functional WordPress themes</li>
                  <li>Create custom templates that match design specifications</li>
                  <li>Iterate quickly on design changes</li>
                  <li>Collaborate more effectively with developers</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">For Agencies</h3>
                <p className="mb-3">
                  Web agencies managing multiple WordPress sites for clients can benefit from:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Centralized management of themes and templates</li>
                  <li>Consistent deployment processes across client sites</li>
                  <li>Reduced development time for new client projects</li>
                  <li>Easier maintenance and updates for existing sites</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">For Theme Developers</h3>
                <p className="mb-3">
                  WordPress theme developers and shops can use the tool to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Streamline theme development and testing</li>
                  <li>Create theme variations and child themes more efficiently</li>
                  <li>Maintain a library of reusable components</li>
                  <li>Generate theme documentation automatically</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="getstarted" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Quick guide to start using the WordPress Template Theme Builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Set Up Your Account</h3>
                  <p>
                    Create an account or sign in to access the dashboard. All your themes, templates, and WordPress site connections will be associated with your account.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Connect WordPress Sites</h3>
                  <p className="mb-2">
                    Add your WordPress sites to the platform for deployment:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Navigate to the WordPress Sites section</li>
                    <li>Click "Add New Site"</li>
                    <li>Enter your site URL and credentials</li>
                    <li>Test the connection to ensure everything works</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">3. Create Your First Theme</h3>
                  <p className="mb-2">
                    Build a WordPress theme from scratch:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Go to the Themes section</li>
                    <li>Click "Create New Theme"</li>
                    <li>Fill in theme details and customize settings</li>
                    <li>Save your theme</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">4. Design Templates</h3>
                  <p className="mb-2">
                    Create templates for your theme:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Navigate to the Templates section</li>
                    <li>Click "Create New Template"</li>
                    <li>Select your theme and template type</li>
                    <li>Design your template with components</li>
                    <li>Save your template</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">5. Deploy to WordPress</h3>
                  <p className="mb-2">
                    Deploy your theme or template to a WordPress site:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Go to the Deployments section</li>
                    <li>Click "New Deployment"</li>
                    <li>Select a WordPress site</li>
                    <li>Choose a theme or template to deploy</li>
                    <li>Click "Deploy" and monitor the progress</li>
                  </ol>
                </div>

                <div className="pt-4">
                  <Link 
                    href="/dashboard" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md inline-flex"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-10 pt-10 border-t">
        <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
        <p className="mb-6">
          For more detailed documentation and guides, check out our comprehensive documentation:
        </p>
        <div className="flex gap-4">
          <Link 
            href="/docs/README.md" 
            target="_blank" 
            className="bg-card hover:bg-muted px-4 py-2 rounded-md border inline-flex"
          >
            Full Documentation
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md inline-flex"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
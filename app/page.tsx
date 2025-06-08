import Image from "next/image";
import Link from "next/link";
import { Palette, FileCode, Globe, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">WordPress Template Theme Builder</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            Create, customize, and deploy WordPress themes and templates with ease
          </p>
          <Link 
            href="/dashboard" 
            className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="bg-card rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full inline-flex mb-6">
                <Palette className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Theme Builder</h3>
              <p className="text-muted-foreground">
                Design and create custom WordPress themes with our intuitive builder
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-green-100 text-green-600 p-3 rounded-full inline-flex mb-6">
                <FileCode className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Template Creator</h3>
              <p className="text-muted-foreground">
                Build page templates, single post layouts, archives and more
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-full inline-flex mb-6">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">WordPress Integration</h3>
              <p className="text-muted-foreground">
                Connect to your WordPress sites for seamless deployment
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="bg-amber-100 text-amber-600 p-3 rounded-full inline-flex mb-6">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">One-Click Deployment</h3>
              <p className="text-muted-foreground">
                Deploy your themes and templates directly to your WordPress sites
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-3">Create</h3>
              <p className="text-muted-foreground">
                Design your WordPress themes and templates using our intuitive builder
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-3">Connect</h3>
              <p className="text-muted-foreground">
                Link your WordPress sites to the platform for seamless integration
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-3">Deploy</h3>
              <p className="text-muted-foreground">
                Deploy your themes and templates with a single click
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Ready to Build Your WordPress Themes?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Get started today and transform how you create WordPress themes and templates
          </p>
          <Link 
            href="/dashboard" 
            className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">WP Builder</h2>
              <p className="text-muted-foreground">WordPress Template Theme Builder</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/themes" className="text-muted-foreground hover:text-foreground transition-colors">
                Themes
              </Link>
              <Link href="/dashboard/templates" className="text-muted-foreground hover:text-foreground transition-colors">
                Templates
              </Link>
              <Link href="/dashboard/wordpress-sites" className="text-muted-foreground hover:text-foreground transition-colors">
                WordPress Sites
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} WordPress Template Theme Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

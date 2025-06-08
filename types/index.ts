import { User, Theme, Template, Component, WordPressSite, Deployment } from '@prisma/client';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: User & {
      id: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

// Theme types
export type ThemeWithRelations = Theme & {
  templates?: Template[];
  components?: Component[];
  deployments?: Deployment[];
};

// Template types
export type TemplateWithRelations = Template & {
  theme?: Theme;
  components?: Component[];
  deployments?: Deployment[];
};

// WordPress Site types
export type WordPressSiteWithRelations = WordPressSite & {
  deployments?: Deployment[];
};

// Component types
export type ComponentWithRelations = Component & {
  theme?: Theme;
  template?: Template;
};

// Deployment types
export type DeploymentWithRelations = Deployment & {
  wordpressSite: WordPressSite;
  theme?: Theme;
  template?: Template;
};

// PHP File Generation types
export interface PHPFileContent {
  filename: string;
  content: string;
}

export interface ThemeExport {
  theme: ThemeWithRelations;
  templates: TemplateWithRelations[];
  components: ComponentWithRelations[];
  phpFiles: PHPFileContent[];
}
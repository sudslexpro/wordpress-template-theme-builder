# WordPress Template Theme Builder - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Authentication](#authentication)
7. [WordPress Integration](#wordpress-integration)
8. [Deployment System](#deployment-system)
9. [PHP Code Generation](#php-code-generation)
10. [Development Guidelines](#development-guidelines)
11. [Testing](#testing)
12. [Performance Optimization](#performance-optimization)
13. [Security Implementation](#security-implementation)

## Architecture Overview

The WordPress Template Theme Builder follows a modern web application architecture with a clear separation of concerns:

### Frontend Layer

- **Client-Side Rendering**: React components for dynamic UI elements
- **Server-Side Rendering**: Next.js for initial page loads and SEO optimization
- **State Management**: React hooks and context for local state, SWR for remote data fetching
- **Styling**: Tailwind CSS with custom theme configuration

### Backend Layer

- **API Routes**: Next.js API routes for serverless backend functionality
- **Database Access**: Prisma ORM for type-safe database operations
- **Authentication**: NextAuth.js for secure user authentication
- **File Operations**: Node.js utilities for file system operations

### External Integrations

- **WordPress Sites**: REST API communication with WordPress instances
- **File Transfer**: SFTP/SSH for secure deployment of files
- **Email Services**: SMTP integration for notifications

## Technology Stack

### Frontend

- **Next.js**: React framework for server-rendered applications
- **React**: JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library built on Radix UI
- **Lucide Icons**: Icon library
- **SWR**: React hooks for data fetching
- **React Hook Form**: Form validation and handling
- **Zod**: Schema validation library

### Backend

- **Next.js API Routes**: Serverless functions
- **Prisma**: ORM for database access
- **NextAuth.js**: Authentication solution
- **Node.js**: JavaScript runtime
- **TypeScript**: Typed JavaScript

### Database

- **PostgreSQL**: Primary database
- **Prisma Migrations**: Database schema management

### DevOps

- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **GitHub Actions**: CI/CD pipelines

## Project Structure

```txt
wordpress-template-theme-builder/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard pages
│   │   ├── themes/         # Theme management
│   │   ├── templates/      # Template management
│   │   ├── wordpress-sites/ # WordPress site management
│   │   └── deployments/    # Deployment management
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── dashboard/          # Dashboard components
│   ├── themes/             # Theme-related components
│   ├── templates/          # Template-related components
│   ├── wordpress-sites/    # WordPress site components
│   ├── deployments/        # Deployment components
│   └── ui/                 # UI components
├── lib/                    # Utility functions and helpers
│   ├── prisma/             # Prisma client and schema
│   ├── auth/               # Authentication utilities
│   ├── wordpress/          # WordPress API utilities
│   ├── deployment/         # Deployment utilities
│   └── utils/              # General utilities
├── public/                 # Static assets
├── styles/                 # Global styles
├── types/                  # TypeScript type definitions
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
└── docs/                   # Documentation
```

## Database Schema

### User

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  themes        Theme[]
  templates     Template[]
  wordpressSites WordPressSite[]
  deployments   Deployment[]
}
```

### Theme

```prisma
model Theme {
  id          String    @id @default(cuid())
  name        String
  description String?
  version     String    @default("1.0.0")
  screenshot  String?
  author      String?
  authorUri   String?
  themeUri    String?
  tags        String?
  status      String    @default("draft") // draft, published
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  templates   Template[]
  deployments Deployment[]
}
```

### Template

```prisma
model Template {
  id          String    @id @default(cuid())
  name        String
  description String?
  type        String    // page, single, archive, etc.
  content     Json?
  status      String    @default("draft") // draft, published
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  themeId     String?
  theme       Theme?    @relation(fields: [themeId], references: [id], onDelete: SetNull)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  deployments Deployment[]
}
```

### WordPress Site

```prisma
model WordPressSite {
  id          String    @id @default(cuid())
  name        String
  url         String
  apiUrl      String?
  username    String
  password    String
  status      String    @default("active") // active, inactive
  lastChecked DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  deployments Deployment[]
}
```

### Deployment

```prisma
model Deployment {
  id              String        @id @default(cuid())
  status          String        @default("pending") // pending, in_progress, completed, failed
  type            String        // theme, template
  startedAt       DateTime?
  completedAt     DateTime?
  logs            DeploymentLog[]
  files           DeploymentFile[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  wordpressSiteId String
  wordpressSite   WordPressSite @relation(fields: [wordpressSiteId], references: [id], onDelete: Cascade)
  themeId         String?
  theme           Theme?        @relation(fields: [themeId], references: [id], onDelete: SetNull)
  templateId      String?
  template        Template?     @relation(fields: [templateId], references: [id], onDelete: SetNull)
}
```

### Deployment Log

```prisma
model DeploymentLog {
  id           String    @id @default(cuid())
  message      String
  level        String    @default("info") // info, warning, error
  timestamp    DateTime  @default(now())
  deploymentId String
  deployment   Deployment @relation(fields: [deploymentId], references: [id], onDelete: Cascade)
}
```

### Deployment File

```prisma
model DeploymentFile {
  id           String    @id @default(cuid())
  path         String
  content      String
  status       String    @default("pending") // pending, uploaded, failed
  deploymentId String
  deployment   Deployment @relation(fields: [deploymentId], references: [id], onDelete: Cascade)
}
```

## API Documentation

### Authentication API

#### POST /api/auth/signin

Authenticate a user and create a session.

**Request Body:**

```json
{
 "email": "user@example.com",
 "password": "password123"
}
```

**Response:**

```json
{
 "user": {
  "id": "clj2x0f3g0000qw3h5j7z8j9k",
  "name": "John Doe",
  "email": "user@example.com",
  "image": "https://example.com/avatar.jpg"
 },
 "expires": "2023-07-01T00:00:00.000Z"
}
```

### Themes API

#### GET /api/themes

Get a list of themes for the authenticated user.

**Query Parameters:**

- `status` (optional): Filter by status (draft, published)
- `search` (optional): Search by name or description
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**

```json
{
 "themes": [
  {
   "id": "clj2x0f3g0001qw3h5j7z8j9k",
   "name": "Modern Blog",
   "description": "A clean, modern blog theme",
   "version": "1.0.0",
   "screenshot": "https://example.com/screenshot.jpg",
   "status": "published",
   "createdAt": "2023-06-01T00:00:00.000Z",
   "updatedAt": "2023-06-01T00:00:00.000Z"
  }
 ],
 "pagination": {
  "total": 10,
  "page": 1,
  "limit": 10,
  "pages": 1
 }
}
```

#### POST /api/themes

Create a new theme.

**Request Body:**

```json
{
 "name": "Modern Blog",
 "description": "A clean, modern blog theme",
 "version": "1.0.0",
 "author": "John Doe",
 "authorUri": "https://example.com",
 "themeUri": "https://example.com/themes/modern-blog",
 "tags": "blog, modern, clean"
}
```

**Response:**

```json
{
 "id": "clj2x0f3g0001qw3h5j7z8j9k",
 "name": "Modern Blog",
 "description": "A clean, modern blog theme",
 "version": "1.0.0",
 "author": "John Doe",
 "authorUri": "https://example.com",
 "themeUri": "https://example.com/themes/modern-blog",
 "tags": "blog, modern, clean",
 "status": "draft",
 "createdAt": "2023-06-01T00:00:00.000Z",
 "updatedAt": "2023-06-01T00:00:00.000Z"
}
```

### Templates API

#### GET /api/templates

Get a list of templates for the authenticated user.

**Query Parameters:**

- `themeId` (optional): Filter by theme ID
- `type` (optional): Filter by template type
- `status` (optional): Filter by status
- `search` (optional): Search by name or description
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**

```json
{
 "templates": [
  {
   "id": "clj2x0f3g0002qw3h5j7z8j9k",
   "name": "Blog Home",
   "description": "Blog homepage template",
   "type": "page",
   "status": "published",
   "themeId": "clj2x0f3g0001qw3h5j7z8j9k",
   "createdAt": "2023-06-01T00:00:00.000Z",
   "updatedAt": "2023-06-01T00:00:00.000Z"
  }
 ],
 "pagination": {
  "total": 5,
  "page": 1,
  "limit": 10,
  "pages": 1
 }
}
```

### WordPress Sites API

#### GET /api/wordpress-sites

Get a list of WordPress sites for the authenticated user.

**Response:**

```json
{
 "sites": [
  {
   "id": "clj2x0f3g0003qw3h5j7z8j9k",
   "name": "My Blog",
   "url": "https://myblog.com",
   "apiUrl": "https://myblog.com/wp-json",
   "status": "active",
   "lastChecked": "2023-06-01T00:00:00.000Z",
   "createdAt": "2023-06-01T00:00:00.000Z",
   "updatedAt": "2023-06-01T00:00:00.000Z"
  }
 ]
}
```

### Deployments API

#### POST /api/deployments

Create a new deployment.

**Request Body:**

```json
{
 "wordpressSiteId": "clj2x0f3g0003qw3h5j7z8j9k",
 "type": "theme",
 "themeId": "clj2x0f3g0001qw3h5j7z8j9k"
}
```

**Response:**

```json
{
 "id": "clj2x0f3g0004qw3h5j7z8j9k",
 "status": "pending",
 "type": "theme",
 "wordpressSiteId": "clj2x0f3g0003qw3h5j7z8j9k",
 "themeId": "clj2x0f3g0001qw3h5j7z8j9k",
 "createdAt": "2023-06-01T00:00:00.000Z",
 "updatedAt": "2023-06-01T00:00:00.000Z"
}
```

## Authentication

The application uses NextAuth.js for authentication with the following providers:

- **Credentials Provider**: Email and password authentication
- **OAuth Providers**: Google, GitHub (optional)

### Authentication Flow

1. User submits credentials via the login form
2. NextAuth.js validates the credentials against the database
3. If valid, a session is created and stored in the database
4. A session cookie is set in the browser
5. The user is redirected to the dashboard

### Session Management

- Sessions are stored in the database
- Session expiration is configurable (default: 30 days)
- Sessions can be revoked by the user (sign out)

### Authorization

- Route protection using Next.js middleware
- API route protection using session validation
- Role-based access control for admin features

## WordPress Integration

### WordPress REST API

The application communicates with WordPress sites using the WordPress REST API:

- **Authentication**: Basic authentication or application passwords
- **Endpoints**: Core WordPress endpoints for themes, templates, and site information
- **Custom Endpoints**: Additional endpoints for specific functionality

### Connection Testing

Before adding a WordPress site, the application tests the connection:

1. Validates the site URL
2. Checks if the WordPress REST API is accessible
3. Verifies the provided credentials
4. Tests basic operations (read, write)

### Site Health Monitoring

The application periodically checks the health of connected WordPress sites:

- Verifies API accessibility
- Checks authentication status
- Monitors for WordPress updates
- Alerts users to potential issues

## Deployment System

### Deployment Process

1. **Preparation**:

   - Generate PHP code for the theme or template
   - Create a deployment record in the database
   - Prepare files for transfer

2. **Execution**:

   - Establish a secure connection to the WordPress site
   - Transfer files to the appropriate directories
   - Update WordPress database if necessary
   - Activate the theme or template if specified

3. **Verification**:

   - Verify file integrity after transfer
   - Check for any errors during deployment
   - Update deployment status in the database

4. **Logging**:
   - Record detailed logs of the deployment process
   - Store information about transferred files
   - Track deployment duration and results

### Deployment Methods

- **SFTP**: Secure File Transfer Protocol for file uploads
- **SSH**: Secure Shell for command execution (if available)
- **WordPress REST API**: API-based deployment for compatible sites

## PHP Code Generation

### Theme Generation

The application generates PHP code for WordPress themes using templates and user configurations:

```php
// Example: style.css
/*
Theme Name: {{name}}
Theme URI: {{themeUri}}
Author: {{author}}
Author URI: {{authorUri}}
Description: {{description}}
Version: {{version}}
Tags: {{tags}}
Text Domain: {{textDomain}}
*/

// Example: functions.php
<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Theme setup
function {{textDomain}}_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));

    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', '{{textDomain}}'),
        'footer' => __('Footer Menu', '{{textDomain}}'),
    ));
}
add_action('after_setup_theme', '{{textDomain}}_setup');

// Enqueue styles and scripts
function {{textDomain}}_scripts() {
    wp_enqueue_style('{{textDomain}}-style', get_stylesheet_uri(), array(), '{{version}}');
    wp_enqueue_script('{{textDomain}}-script', get_template_directory_uri() . '/assets/js/main.js', array('jquery'), '{{version}}', true);
}
add_action('wp_enqueue_scripts', '{{textDomain}}_scripts');
```

### Template Generation

The application generates PHP code for WordPress templates based on user designs:

```php
// Example: page.php
<?php
/**
 * Template Name: {{name}}
 * Description: {{description}}
 */

get_header();
?>

<main id="main" class="site-main">
    <div class="container">
        <?php
        while (have_posts()) :
            the_post();
            ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <header class="entry-header">
                    <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
                </header>

                <div class="entry-content">
                    <?php the_content(); ?>
                </div>
            </article>
        <?php endwhile; ?>
    </div>
</main>

<?php
get_footer();
```

### Component Generation

The application generates PHP code for reusable components:

```php
// Example: template-parts/content.php
<?php
/**
 * Component: {{name}}
 * Description: {{description}}
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <header class="entry-header">
        <?php
        if (is_singular()) :
            the_title('<h1 class="entry-title">', '</h1>');
        else :
            the_title('<h2 class="entry-title"><a href="' . esc_url(get_permalink()) . '" rel="bookmark">', '</a></h2>');
        endif;
        ?>
    </header>

    <?php if (has_post_thumbnail()) : ?>
        <div class="post-thumbnail">
            <?php the_post_thumbnail('large'); ?>
        </div>
    <?php endif; ?>

    <div class="entry-content">
        <?php
        if (is_singular()) :
            the_content();
        else :
            the_excerpt();
            ?>
            <a href="<?php echo esc_url(get_permalink()); ?>" class="read-more">
                <?php esc_html_e('Read More', '{{textDomain}}'); ?>
            </a>
        <?php endif; ?>
    </div>
</article>
```

## Development Guidelines

### Coding Standards

- **JavaScript/TypeScript**: Follow the Airbnb JavaScript Style Guide
- **React**: Follow the React Hooks pattern for components
- **CSS**: Use Tailwind CSS utility classes
- **PHP**: Follow WordPress PHP Coding Standards

### Git Workflow

- **Branch Naming**: Use descriptive branch names (feature/_, bugfix/_, etc.)
- **Commit Messages**: Follow conventional commits format
- **Pull Requests**: Require code review before merging
- **CI/CD**: Automated testing and linting on pull requests

### Documentation

- **Code Comments**: Document complex logic and functions
- **API Documentation**: Document all API endpoints
- **Component Documentation**: Document component props and usage
- **README**: Keep project documentation up to date

## Testing

### Unit Testing

- **Jest**: Test individual functions and components
- **React Testing Library**: Test React components
- **API Tests**: Test API endpoints

### Integration Testing

- **End-to-End Tests**: Test complete user flows
- **API Integration Tests**: Test API integrations
- **WordPress Integration Tests**: Test WordPress site connections

### Manual Testing

- **Browser Testing**: Test in multiple browsers
- **Device Testing**: Test on different devices and screen sizes
- **Deployment Testing**: Test deployment to WordPress sites

## Performance Optimization

### Frontend Optimization

- **Code Splitting**: Split code into smaller chunks
- **Image Optimization**: Optimize images for web
- **Lazy Loading**: Lazy load images and components
- **Caching**: Implement client-side caching

### Backend Optimization

- **Database Queries**: Optimize database queries
- **API Caching**: Cache API responses
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Background Processing**: Use background jobs for long-running tasks

## Security Implementation

### Authentication Security

- **Password Hashing**: Use bcrypt for password hashing
- **CSRF Protection**: Implement CSRF tokens for forms
- **Rate Limiting**: Limit login attempts
- **Session Management**: Secure session handling

### Data Security

- **Input Validation**: Validate all user input
- **Output Escaping**: Escape output to prevent XSS
- **SQL Injection Prevention**: Use parameterized queries
- **Sensitive Data**: Encrypt sensitive data

### API Security

- **Authentication**: Require authentication for API endpoints
- **Authorization**: Implement proper access control
- **Rate Limiting**: Limit API requests
- **Input Validation**: Validate all API inputs

### Deployment Security

- **Secure Connections**: Use SFTP/SSH for file transfers
- **File Permissions**: Set proper file permissions
- **Code Validation**: Validate generated code
- **Error Handling**: Implement proper error handling

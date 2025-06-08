import { Theme, Template, Component } from '@prisma/client';
import { ThemeWithRelations, PHPFileContent, ThemeExport } from '@/types';

/**
 * Generate WordPress theme files from a theme
 */
export async function generateWordPressTheme(
  theme: ThemeWithRelations
): Promise<ThemeExport> {
  const phpFiles: PHPFileContent[] = [];

  // Generate style.css
  phpFiles.push({
    filename: 'style.css',
    content: generateStyleCSS(theme),
  });

  // Generate functions.php
  phpFiles.push({
    filename: 'functions.php',
    content: generateFunctionsPhp(theme),
  });

  // Generate index.php
  phpFiles.push({
    filename: 'index.php',
    content: generateIndexPhp(theme),
  });

  // Generate header.php
  phpFiles.push({
    filename: 'header.php',
    content: generateHeaderPhp(theme),
  });

  // Generate footer.php
  phpFiles.push({
    filename: 'footer.php',
    content: generateFooterPhp(theme),
  });

  // Generate sidebar.php
  phpFiles.push({
    filename: 'sidebar.php',
    content: generateSidebarPhp(theme),
  });

  // Generate template files
  if (theme.templates && theme.templates.length > 0) {
    for (const template of theme.templates) {
      const templateFile = generateTemplateFile(template);
      phpFiles.push(templateFile);
    }
  }

  // Generate component files
  if (theme.components && theme.components.length > 0) {
    for (const component of theme.components) {
      const componentFile = generateComponentFile(component);
      phpFiles.push(componentFile);
    }
  }

  return {
    theme,
    templates: theme.templates || [],
    components: theme.components || [],
    phpFiles,
  };
}

/**
 * Generate WordPress template files from a template
 */
export async function generateWordPressTemplate(
  template: Template
): Promise<PHPFileContent[]> {
  const phpFiles: PHPFileContent[] = [];

  // Generate template file
  phpFiles.push(generateTemplateFile(template));

  return phpFiles;
}

/**
 * Generate style.css file content
 */
function generateStyleCSS(theme: Theme): string {
  return `/*
Theme Name: ${theme.name}
Description: ${theme.description || ''}
Author: WordPress Theme Builder
Version: 1.0
Text Domain: ${theme.name.toLowerCase().replace(/\s+/g, '-')}
*/

${theme.cssStyles || ''}`;
}

/**
 * Generate functions.php file content
 */
function generateFunctionsPhp(theme: Theme): string {
  return `<?php
/**
 * ${theme.name} functions and definitions
 */

// Theme setup
function ${theme.name.toLowerCase().replace(/\s+/g, '_')}_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
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
        'primary' => __('Primary Menu', '${theme.name.toLowerCase().replace(/\s+/g, '-')}'),
        'footer' => __('Footer Menu', '${theme.name.toLowerCase().replace(/\s+/g, '-')}'),
    ));
}
add_action('after_setup_theme', '${theme.name.toLowerCase().replace(/\s+/g, '_')}_setup');

// Enqueue scripts and styles
function ${theme.name.toLowerCase().replace(/\s+/g, '_')}_scripts() {
    // Enqueue main stylesheet
    wp_enqueue_style('${theme.name.toLowerCase().replace(/\s+/g, '-')}-style', get_stylesheet_uri(), array(), '1.0.0');
    
    // Enqueue custom scripts
    wp_enqueue_script('${theme.name.toLowerCase().replace(/\s+/g, '-')}-script', get_template_directory_uri() . '/js/main.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', '${theme.name.toLowerCase().replace(/\s+/g, '_')}_scripts');

// Register widget areas
function ${theme.name.toLowerCase().replace(/\s+/g, '_')}_widgets_init() {
    register_sidebar(array(
        'name'          => __('Sidebar', '${theme.name.toLowerCase().replace(/\s+/g, '-')}'),
        'id'            => 'sidebar-1',
        'description'   => __('Add widgets here to appear in your sidebar.', '${theme.name.toLowerCase().replace(/\s+/g, '-')}'),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ));
}
add_action('widgets_init', '${theme.name.toLowerCase().replace(/\s+/g, '_')}_widgets_init');

${theme.phpCode || ''}
`;
}

/**
 * Generate index.php file content
 */
function generateIndexPhp(theme: Theme): string {
  return `<?php
/**
 * The main template file
 */

get_header();
?>

<main id="main" class="site-main">
    <?php
    if (have_posts()) :
        while (have_posts()) :
            the_post();
            get_template_part('template-parts/content', get_post_type());
        endwhile;

        the_posts_navigation();
    else :
        get_template_part('template-parts/content', 'none');
    endif;
    ?>
</main>

<?php
get_sidebar();
get_footer();
`;
}

/**
 * Generate header.php file content
 */
function generateHeaderPhp(theme: Theme): string {
  // Find header component if it exists
  const headerComponent = theme.components?.find(c => c.type === 'header');

  return `<?php
/**
 * The header for our theme
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site">
    <header id="masthead" class="site-header">
        <div class="site-branding">
            <?php
            if (has_custom_logo()) :
                the_custom_logo();
            else :
            ?>
                <h1 class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>" rel="home"><?php bloginfo('name'); ?></a></h1>
            <?php
                $description = get_bloginfo('description', 'display');
                if ($description || is_customize_preview()) :
            ?>
                <p class="site-description"><?php echo $description; ?></p>
            <?php
                endif;
            endif;
            ?>
        </div>

        <nav id="site-navigation" class="main-navigation">
            <button class="menu-toggle" aria-controls="primary-menu" aria-expanded="false"><?php esc_html_e('Menu', '${theme.name.toLowerCase().replace(/\s+/g, '-')}'); ?></button>
            <?php
            wp_nav_menu(array(
                'theme_location' => 'primary',
                'menu_id'        => 'primary-menu',
            ));
            ?>
        </nav>
    </header>

    <div id="content" class="site-content">
${headerComponent?.phpCode ? headerComponent.phpCode : ''}
`;
}

/**
 * Generate footer.php file content
 */
function generateFooterPhp(theme: Theme): string {
  // Find footer component if it exists
  const footerComponent = theme.components?.find(c => c.type === 'footer');

  return `<?php
/**
 * The footer for our theme
 */
?>

    </div><!-- #content -->

    <footer id="colophon" class="site-footer">
        <div class="site-info">
            <?php
            printf(
                esc_html__('© %1$s %2$s', '${theme.name.toLowerCase().replace(/\s+/g, '-')}'),
                date('Y'),
                get_bloginfo('name')
            );
            ?>
        </div>
        <nav class="footer-navigation">
            <?php
            wp_nav_menu(array(
                'theme_location' => 'footer',
                'menu_id'        => 'footer-menu',
                'depth'          => 1,
            ));
            ?>
        </nav>
${footerComponent?.phpCode ? footerComponent.phpCode : ''}
    </footer>
</div><!-- #page -->

<?php wp_footer(); ?>
</body>
</html>
`;
}

/**
 * Generate sidebar.php file content
 */
function generateSidebarPhp(theme: Theme): string {
  // Find sidebar component if it exists
  const sidebarComponent = theme.components?.find(c => c.type === 'sidebar');

  return `<?php
/**
 * The sidebar containing the main widget area
 */

if (!is_active_sidebar('sidebar-1')) {
    return;
}
?>

<aside id="secondary" class="widget-area">
    <?php dynamic_sidebar('sidebar-1'); ?>
${sidebarComponent?.phpCode ? sidebarComponent.phpCode : ''}
</aside>
`;
}

/**
 * Generate template file content
 */
function generateTemplateFile(template: Template): PHPFileContent {
  let filename = '';
  let content = '';

  // Determine filename based on template type
  switch (template.type) {
    case 'page':
      filename = 'page.php';
      break;
    case 'single':
      filename = 'single.php';
      break;
    case 'archive':
      filename = 'archive.php';
      break;
    case 'home':
      filename = 'home.php';
      break;
    case 'search':
      filename = 'search.php';
      break;
    case '404':
      filename = '404.php';
      break;
    default:
      // For custom templates, create a template file in the template-parts directory
      filename = `template-parts/${template.name.toLowerCase().replace(/\s+/g, '-')}.php`;
  }

  // Generate content based on template type and custom code
  content = `<?php
/**
 * Template Name: ${template.name}
 * Description: ${template.description || ''}
 */

get_header();
?>

<main id="main" class="site-main">
${template.phpCode || '    <!-- Default template content -->'}
</main>

<?php
get_sidebar();
get_footer();
`;

  return {
    filename,
    content,
  };
}

/**
 * Generate component file content
 */
function generateComponentFile(component: Component): PHPFileContent {
  const filename = `template-parts/components/${component.name.toLowerCase().replace(/\s+/g, '-')}.php`;

  const content = `<?php
/**
 * Component: ${component.name}
 * Description: ${component.description || ''}
 */
?>

<div class="component component-${component.name.toLowerCase().replace(/\s+/g, '-')}">
${component.phpCode || '    <!-- Component content -->'}
</div>
`;

  return {
    filename,
    content,
  };
}
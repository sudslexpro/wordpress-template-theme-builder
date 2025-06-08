import { Template, Component } from '@prisma/client';
import { TemplateWithRelations, PHPFileContent } from '@/types';

/**
 * Generate WordPress template files from a template
 */
export async function generateWordPressTemplate(
  template: TemplateWithRelations
): Promise<PHPFileContent[]> {
  const phpFiles: PHPFileContent[] = [];

  // Generate template file
  phpFiles.push(generateTemplateFile(template));

  // Generate component files if they exist
  if (template.components && template.components.length > 0) {
    for (const component of template.components) {
      phpFiles.push(generateComponentFile(component));
    }
  }

  return phpFiles;
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

    <?php
    if (have_posts()) :
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
            <?php
        endwhile;

        the_posts_navigation();
    else :
        ?>
        <p><?php esc_html_e('No content found.', 'theme'); ?></p>
        <?php
    endif;
    ?>
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
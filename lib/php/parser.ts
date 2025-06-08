import { Engine, Parser } from 'php-parser';

/**
 * Parse PHP code and return the AST (Abstract Syntax Tree)
 */
export function parsePhpCode(code: string): any {
  const parser = new Engine({
    parser: {
      extractDoc: true,
      php7: true,
    },
    ast: {
      withPositions: true,
    },
  });

  try {
    return parser.parseCode(code, 'input.php');
  } catch (error) {
    console.error('Error parsing PHP code:', error);
    throw new Error(`Failed to parse PHP code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate PHP code syntax
 */
export function validatePhpSyntax(code: string): { valid: boolean; error?: string } {
  try {
    parsePhpCode(code);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract PHP functions from code
 */
export function extractPhpFunctions(code: string): string[] {
  try {
    const ast = parsePhpCode(code);
    const functions: string[] = [];

    // Traverse the AST to find function declarations
    if (ast.children && Array.isArray(ast.children)) {
      ast.children.forEach((node: any) => {
        if (node.kind === 'function' && node.name) {
          functions.push(node.name.name);
        }
      });
    }

    return functions;
  } catch (error) {
    console.error('Error extracting PHP functions:', error);
    return [];
  }
}

/**
 * Extract PHP classes from code
 */
export function extractPhpClasses(code: string): string[] {
  try {
    const ast = parsePhpCode(code);
    const classes: string[] = [];

    // Traverse the AST to find class declarations
    if (ast.children && Array.isArray(ast.children)) {
      ast.children.forEach((node: any) => {
        if (node.kind === 'class' && node.name) {
          classes.push(node.name.name);
        }
      });
    }

    return classes;
  } catch (error) {
    console.error('Error extracting PHP classes:', error);
    return [];
  }
}

/**
 * Generate PHP code for a WordPress theme function
 */
export function generateThemeFunction(
  functionName: string,
  params: string[] = [],
  body: string
): string {
  const paramsStr = params.join(', ');
  return `
function ${functionName}(${paramsStr}) {
    ${body.replace(/\n/g, '\n    ')}
}
`;
}

/**
 * Generate PHP code for a WordPress action hook
 */
export function generateActionHook(
  hookName: string,
  functionName: string,
  priority: number = 10
): string {
  return `add_action('${hookName}', '${functionName}', ${priority});
`;
}

/**
 * Generate PHP code for a WordPress filter hook
 */
export function generateFilterHook(
  hookName: string,
  functionName: string,
  priority: number = 10
): string {
  return `add_filter('${hookName}', '${functionName}', ${priority});
`;
}

/**
 * Generate PHP code for a WordPress shortcode
 */
export function generateShortcode(
  tag: string,
  functionName: string
): string {
  return `add_shortcode('${tag}', '${functionName}');
`;
}

/**
 * Generate PHP code for a WordPress widget
 */
export function generateWidgetClass(
  className: string,
  widgetName: string,
  widgetDescription: string
): string {
  return `
class ${className} extends WP_Widget {
    public function __construct() {
        parent::__construct(
            '${className.toLowerCase()}',
            __('${widgetName}', 'text-domain'),
            ['description' => __('${widgetDescription}', 'text-domain')]
        );
    }

    public function widget($args, $instance) {
        // Widget output
        echo $args['before_widget'];
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        echo '<div class="widget-content">';
        // Widget content here
        echo '</div>';
        echo $args['after_widget'];
    }

    public function form($instance) {
        // Widget admin form
        $title = !empty($instance['title']) ? $instance['title'] : __('New title', 'text-domain');
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Title:', 'text-domain'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <?php
    }

    public function update($new_instance, $old_instance) {
        // Save widget options
        $instance = [];
        $instance['title'] = (!empty($new_instance['title'])) ? strip_tags($new_instance['title']) : '';
        return $instance;
    }
}

// Register the widget
function register_${className.toLowerCase()}_widget() {
    register_widget('${className}');
}
add_action('widgets_init', 'register_${className.toLowerCase()}_widget');
`;
}
import axios from 'axios';
import { WordPressSite, Theme, Template, Deployment } from '@prisma/client';
import { prisma } from '@/lib/db';

/**
 * Interface for n8n webhook configuration
 */
interface N8nWebhookConfig {
  webhookUrl: string;
  apiKey?: string;
}

/**
 * Get n8n webhook configuration from environment variables
 */
function getN8nConfig(): N8nWebhookConfig {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!webhookUrl) {
    throw new Error('N8N_WEBHOOK_URL environment variable is not set');
  }

  return {
    webhookUrl,
    apiKey,
  };
}

/**
 * Trigger n8n workflow for theme deployment
 */
export async function triggerThemeDeploymentWorkflow(
  deployment: Deployment,
  wordpressSite: WordPressSite,
  theme: Theme
): Promise<void> {
  try {
    const n8nConfig = getN8nConfig();

    // Prepare the payload for n8n
    const payload = {
      deploymentId: deployment.id,
      wordpressSiteId: wordpressSite.id,
      wordpressSiteUrl: wordpressSite.url,
      wordpressSiteApiUrl: wordpressSite.apiUrl,
      themeId: theme.id,
      themeName: theme.name,
      deploymentType: 'theme',
    };

    // Set up request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if available
    if (n8nConfig.apiKey) {
      headers['X-N8N-API-KEY'] = n8nConfig.apiKey;
    }

    // Trigger the n8n workflow
    await axios.post(n8nConfig.webhookUrl, payload, { headers });

    // Update deployment status
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'in-progress',
        logs: 'Triggered n8n workflow for theme deployment...',
      },
    });
  } catch (error) {
    // Handle errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'failed',
        logs: `Failed to trigger n8n workflow: ${errorMessage}`,
      },
    });
    throw error;
  }
}

/**
 * Trigger n8n workflow for template deployment
 */
export async function triggerTemplateDeploymentWorkflow(
  deployment: Deployment,
  wordpressSite: WordPressSite,
  template: Template
): Promise<void> {
  try {
    const n8nConfig = getN8nConfig();

    // Prepare the payload for n8n
    const payload = {
      deploymentId: deployment.id,
      wordpressSiteId: wordpressSite.id,
      wordpressSiteUrl: wordpressSite.url,
      wordpressSiteApiUrl: wordpressSite.apiUrl,
      templateId: template.id,
      templateName: template.name,
      templateType: template.type,
      deploymentType: 'template',
    };

    // Set up request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if available
    if (n8nConfig.apiKey) {
      headers['X-N8N-API-KEY'] = n8nConfig.apiKey;
    }

    // Trigger the n8n workflow
    await axios.post(n8nConfig.webhookUrl, payload, { headers });

    // Update deployment status
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'in-progress',
        logs: 'Triggered n8n workflow for template deployment...',
      },
    });
  } catch (error) {
    // Handle errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'failed',
        logs: `Failed to trigger n8n workflow: ${errorMessage}`,
      },
    });
    throw error;
  }
}

/**
 * Handle n8n webhook callback for deployment status updates
 */
export async function handleN8nCallback(
  deploymentId: string,
  status: 'completed' | 'failed',
  logs: string
): Promise<Deployment> {
  // Update deployment status based on n8n callback
  const updatedDeployment = await prisma.deployment.update({
    where: { id: deploymentId },
    data: {
      status,
      logs,
    },
  });

  return updatedDeployment;
}

/**
 * Create n8n workflow for WordPress theme/template deployment
 * This is a placeholder function that would be implemented in a real application
 * to programmatically create n8n workflows
 */
export async function createN8nDeploymentWorkflow(): Promise<string> {
  // In a real implementation, this would create an n8n workflow using the n8n API
  // For now, we'll just return a placeholder workflow ID
  return 'placeholder-workflow-id';
}
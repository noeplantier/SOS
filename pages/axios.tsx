import axios, { AxiosInstance } from 'axios';

export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionResult {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  data: any;
}

export class N8NController {
  private client: AxiosInstance;
  
  constructor(baseURL: string, apiKey: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // Obtenir tous les workflows
  async getWorkflows(): Promise<Workflow[]> {
    try {
      const response = await this.client.get('/workflows');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  // Obtenir un workflow par ID
  async getWorkflowById(id: string): Promise<Workflow> {
    try {
      const response = await this.client.get(`/workflows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workflow ${id}:`, error);
      throw error;
    }
  }

  // Activer/désactiver un workflow
  async toggleWorkflowActive(id: string, active: boolean): Promise<Workflow> {
    try {
      const response = await this.client.patch(`/workflows/${id}`, { active });
      return response.data;
    } catch (error) {
      console.error(`Error toggling workflow ${id}:`, error);
      throw error;
    }
  }

  // Exécuter un workflow
  async executeWorkflow(id: string, data?: any): Promise<ExecutionResult> {
    try {
      const response = await this.client.post(`/workflows/${id}/execute`, data || {});
      return response.data;
    } catch (error) {
      console.error(`Error executing workflow ${id}:`, error);
      throw error;
    }
  }

  // Obtenir le résultat d'une exécution
  async getExecutionResult(executionId: string): Promise<ExecutionResult> {
    try {
      const response = await this.client.get(`/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching execution ${executionId}:`, error);
      throw error;
    }
  }

  // Déclencher un workflow via un webhook
  async triggerWebhook(webhookUrl: string, data: any): Promise<any> {
    try {
      const response = await axios.post(webhookUrl, data);
      return response.data;
    } catch (error) {
      console.error(`Error triggering webhook:`, error);
      throw error;
    }
  }

  // Obtenir les dernières exécutions d'un workflow
  async getWorkflowExecutions(workflowId: string, limit = 10): Promise<ExecutionResult[]> {
    try {
      const response = await this.client.get(`/executions`, {
        params: {
          workflowId,
          limit
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching executions for workflow ${workflowId}:`, error);
      throw error;
    }
  }
}

// Singleton instance
export const n8nController = new N8NController(
  process.env.NEXT_PUBLIC_N8N_API_URL || 'http://localhost:5678',
  process.env.NEXT_PUBLIC_N8N_API_KEY || ''
);
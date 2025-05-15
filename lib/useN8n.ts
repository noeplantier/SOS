import { useState, useEffect, useCallback, useMemo } from "react";
import { config } from "./config";

/**
 * Interface pour un workflow n8n
 */
export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour une exécution de workflow
 */
export interface Execution {
  id: string;
  workflowId: string;
  finished: boolean;
  mode: string;
  waitTill?: string;
  startedAt: string;
  stoppedAt?: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  data: any;
}

/**
 * Options pour les requêtes API
 */
interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Hook personnalisé pour l'intégration avec n8n
 * Optimisé pour la performance et la réactivité
 */
export function useN8n() {
  // State
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<Record<string, Execution[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // URL de base et clé API
  const baseUrl = config.n8nApiUrl;
  const apiKey = config.n8nApiKey;
  
  /**
   * Fonction optimisée pour les appels API
   * Utilise AbortController pour les requêtes annulables
   */
  const apiCall = useCallback(async <T>(
    endpoint: string,
    options: ApiOptions = {},
    abortSignal?: AbortSignal
  ): Promise<T> => {
    const { method = 'GET', body, headers = {} } = options;
    const url = `${baseUrl}${endpoint}`;
    
    // Fusionner les en-têtes avec les en-têtes par défaut
    const mergedHeaders = {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json',
      ...headers
    };
    
    try {
      const response = await fetch(url, {
        method,
        headers: mergedHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: abortSignal
      });
      
      if (!response.ok) {
        // Extraire le message d'erreur de la réponse
        let errorMsg = `HTTP error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          // Ignorer les erreurs lors de l'extraction du message
        }
        
        throw new Error(errorMsg);
      }
      
      return await response.json();
    } catch (error) {
      // Ne pas logguer les erreurs d'annulation
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error(`API call failed: ${endpoint}`, error);
      }
      throw error;
    }
  }, [baseUrl, apiKey]);
  
  /**
   * Charger tous les workflows
   * Cache optimisé avec clé de version
   */
  const loadWorkflows = useCallback(async (silent: boolean = false) => {
    if (isLoading && !silent) return workflows;
    
    if (!silent) setIsLoading(true);
    setError(null);
    
    // Créer un AbortController pour pouvoir annuler la requête
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      // Appeler l'API avec AbortSignal
      const response: { data: Workflow[] } = await apiCall(
        '/workflows',
        { method: 'GET' },
        controller.signal
      );
      
      // Mettre à jour l'état
      const data = response.data || [];
      setWorkflows(data);
      
      // Retourner les données
      return data;
    } catch (err) {
      // Gérer l'erreur
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Impossible de charger les workflows: ${errorMessage}`);
      
      // Retourner les workflows en cache
      return workflows;
    } finally {
      clearTimeout(timeoutId);
      if (!silent) setIsLoading(false);
    }
  }, [apiCall, isLoading, workflows]);
  
  /**
   * Charger les exécutions d'un workflow
   * Avec mise en cache optimisée
   */
  const loadExecutions = useCallback(async (
    workflowId: string, 
    limit: number = 10,
    silent: boolean = false
  ) => {
    if (!workflowId) return [];
    
    if (!silent) setIsLoading(true);
    
    try {
      // Appeler l'API
      const response: { data: Execution[] } = await apiCall(
        `/executions?workflowId=${workflowId}&limit=${limit}`
      );
      
      // Mettre à jour l'état avec une fonction de mise à jour immutable
      setExecutions(prev => ({
        ...prev,
        [workflowId]: response.data || []
      }));
      
      // Retourner les données
      return response.data || [];
    } catch (err) {
      // Gérer l'erreur
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error(`Impossible de charger les exécutions (${workflowId}):`, errorMessage);
      
      // Retourner les exécutions en cache
      return executions[workflowId] || [];
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [apiCall, executions]);
  
  /**
   * Activer/désactiver un workflow
   */
  const toggleWorkflowActive = useCallback(async (
    workflowId: string, 
    active: boolean
  ) => {
    setIsLoading(true);
    
    try {
      // Appeler l'API
      const response: Workflow = await apiCall(
        `/workflows/${workflowId}`,
        { method: 'PATCH', body: { active } }
      );
      
      // Mettre à jour l'état des workflows
      setWorkflows(prevWorkflows => 
        prevWorkflows.map(workflow => 
          workflow.id === workflowId ? response : workflow
        )
      );
      
      // Retourner le workflow mis à jour
      return response;
    } catch (err) {
      // Gérer l'erreur
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Impossible de modifier le workflow: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);
  
  /**
   * Exécuter un workflow
   */
  const executeWorkflow = useCallback(async (
    workflowId: string, 
    data?: any
  ) => {
    setIsLoading(true);
    
    try {
      // Appeler l'API
      const response = await apiCall(
        `/workflows/${workflowId}/execute`,
        { method: 'POST', body: data || {} }
      );
      
      // Recharger les exécutions après un court délai
      setTimeout(() => loadExecutions(workflowId), 1000);
      
      // Retourner la réponse
      return response;
    } catch (err) {
      // Gérer l'erreur
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Impossible d'exécuter le workflow: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, loadExecutions]);
  
  // Auto-rafraîchissement des workflows
  useEffect(() => {
    // Charger les workflows initiaux
    loadWorkflows();
    
    // Configurer l'intervalle de rafraîchissement
    const intervalId = setInterval(() => {
      loadWorkflows(true); // Silencieux
    }, config.refreshIntervals.workflows);
    
    // Nettoyer l'intervalle à la destruction
    return () => clearInterval(intervalId);
  }, [loadWorkflows]);
  
  // API publique - Mémoïsée pour éviter les re-rendus inutiles
  const api = useMemo(() => ({
    // Workflows
    workflows,
    loadWorkflows,
    toggleWorkflowActive,
    executeWorkflow,
    
    // Exécutions
    executions,
    loadExecutions,
    getExecutions: (workflowId: string) => executions[workflowId] || [],
    
    // État
    isLoading,
    error,
    
    // Contrôleur avancé pour les appels API directs
    n8nController: {
      apiCall,
      baseUrl,
    }
  }), [
    workflows,
    executions,
    isLoading,
    error,
    loadWorkflows,
    loadExecutions,
    toggleWorkflowActive,
    executeWorkflow,
    apiCall,
    baseUrl
  ]);
  
  return api;
}

export default useN8n;
"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Play, RefreshCw, Check, AlertCircle, Clock, ChevronRight, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { config } from "../lib/config";
import { cn } from "../lib/utils";

// Définition des types pour une meilleure type safety
interface Workflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
}

interface ExecutionResult {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  data: any;
}

// Simulation des composants UI absents - versions simplifiées
const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-lg border bg-white shadow-sm", className)} {...props}>{children}</div>
);

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-2xl font-semibold", className)} {...props} />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-gray-500", className)} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

const Badge = ({ 
  variant = "default", 
  className, 
  children, 
  ...props 
}: { 
  variant?: "default" | "destructive" | "outline", 
  className?: string,
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-200 text-gray-700"
  };
  
  return (
    <div 
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", 
        variantClasses[variant], 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

const Button = ({ 
  variant = "default", 
  size = "default", 
  className, 
  disabled = false,
  children,
  onClick,
  ...props 
}: { 
  variant?: "default" | "destructive" | "outline" | "ghost", 
  size?: "default" | "sm" | "lg" | "icon",
  className?: string,
  disabled?: boolean,
  onClick?: (e: React.MouseEvent) => void,
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-200 hover:bg-gray-100",
    ghost: "hover:bg-gray-100"
  };
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 py-1 text-sm",
    lg: "h-11 px-8 py-3",
    icon: "h-10 w-10"
  };
  
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none", 
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Switch = ({
  checked,
  onCheckedChange,
  onClick,
}: {
  checked?: boolean,
  onCheckedChange?: (checked: boolean) => void,
  onClick?: (e: React.MouseEvent) => void
}) => (
  <button
    role="switch"
    aria-checked={checked ? 'true' : 'false'}
    onClick={(e) => {
      if (onClick) onClick(e);
      if (onCheckedChange) onCheckedChange(!checked);
    }}
    className={`relative inline-flex h-6 w-11 items-center rounded-full ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
  >
    <span
      className={`${
        checked ? 'translate-x-6' : 'translate-x-1'
      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </button>
);

const Separator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("h-[1px] w-full bg-gray-200", className)} {...props} />
);

const Tabs = ({ value, children }: { value: string, children: React.ReactNode }) => (
  <div>{children}</div>
);

const TabsList = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex space-x-1 rounded-lg bg-gray-100 p-1", className)} {...props}>{children}</div>
);

const TabsTrigger = ({ 
  value, 
  children, 
  className,
  ...props 
}: { 
  value: string,
  children: React.ReactNode,
  className?: string
} & React.HTMLAttributes<HTMLButtonElement>) => {
  const parent = React.useContext(TabsContext);
  const isActive = parent.value === value;
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-white shadow-sm text-gray-900"
          : "text-gray-500 hover:text-gray-900",
        className
      )}
      onClick={() => parent.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className, ...props }: {
  value: string,
  children: React.ReactNode,
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) => {
  const parent = React.useContext(TabsContext);
  if (parent.value !== value) return null;
  
  return (
    <div
      className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2", className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Contexte pour les tabs
const TabsContext = React.createContext({
  value: "",
  onValueChange: (value: string) => {}
});

// Version simplifiée du composant toast
const toast = ({ 
  title, 
  description, 
  variant = "default"
}: {
  title?: string,
  description?: string,
  variant?: "default" | "destructive"
}) => {
  console.log(`Toast (${variant}): ${title} - ${description}`);
};

// Version simplifiée du composant Skeleton
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-pulse rounded-md bg-gray-200", className)} {...props} />
);

// Hook personnalisé pour les API calls
const useN8nApi = () => {
  const baseUrl = config.n8nApiUrl;
  const apiKey = config.n8nApiKey;

  // Fonction optimisée pour les requêtes API
  const apiCall = useCallback(async (endpoint: string, method: string = 'GET', data?: any) => {
    const url = `${baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed (${method} ${endpoint}):`, error);
      throw error;
    }
  }, [baseUrl, apiKey]);

  // Fonctions API spécifiques avec mémoïsation
  return useMemo(() => ({
    getWorkflows: () => apiCall('/workflows'),
    getWorkflowById: (id: string) => apiCall(`/workflows/${id}`),
    toggleWorkflowActive: (id: string, active: boolean) => 
      apiCall(`/workflows/${id}`, 'PATCH', { active }),
    executeWorkflow: (id: string, data?: any) => 
      apiCall(`/workflows/${id}/execute`, 'POST', data || {}),
    getWorkflowExecutions: (workflowId: string, limit: number = 10) => 
      apiCall(`/executions?workflowId=${workflowId}&limit=${limit}`)
  }), [apiCall]);
};

// Composant pour le statut d'exécution
const ExecutionStatus = memo(({ status }: { status: string }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      {getStatusIcon(status)}
      <span className="font-medium capitalize">{status}</span>
    </div>
  );
});

ExecutionStatus.displayName = 'ExecutionStatus';

// Composant pour un item de workflow
const WorkflowItem = memo(({ 
  workflow, 
  isSelected, 
  onSelect, 
  onToggle, 
  onExecute,
  isExecuting
}: { 
  workflow: Workflow, 
  isSelected: boolean, 
  onSelect: () => void,
  onToggle: () => void,
  onExecute: () => void,
  isExecuting: boolean
}) => {
  // Éviter les re-renders inutiles
  const handleClick = useCallback(() => {
    onSelect();
  }, [onSelect]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  }, [onToggle]);

  const handleExecute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onExecute();
  }, [onExecute]);
  
  return (
    <div 
      className={cn(
        "p-3 rounded-md border flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors",
        isSelected && "bg-gray-50"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <Badge variant={workflow.active ? "default" : "outline"}>
          {workflow.active ? "Actif" : "Inactif"}
        </Badge>
        <span className="font-medium truncate max-w-[150px] md:max-w-[250px]">{workflow.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={workflow.active}
          onCheckedChange={() => handleToggle as unknown as (e: React.MouseEvent) => void}
          onClick={(e) => e.stopPropagation()}
        />
        <Button
          size="icon"
          variant="outline"
          onClick={handleExecute}
          disabled={isExecuting || !workflow.active}
        >
          {isExecuting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
        </Button>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
});

WorkflowItem.displayName = 'WorkflowItem';

// Composant principal WorkflowManager
export function WorkflowManager() {
  // État local
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<ExecutionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('workflows');
  
  // API n8n
  const api = useN8nApi();

  // Chargement initial des workflows
  useEffect(() => {
    loadWorkflows();
    
    // Auto-rafraîchissement des workflows
    const intervalId = setInterval(() => {
      if (!isExecuting && activeTab === 'workflows') {
        loadWorkflows(false); // Silencieusement
      }
    }, config.refreshIntervals.workflows);
    
    return () => clearInterval(intervalId);
  }, [isExecuting, activeTab]);

  // Chargement des exécutions lorsque le workflow sélectionné change
  useEffect(() => {
    if (selectedWorkflow) {
      loadWorkflowExecutions(selectedWorkflow.id);
      
      // Auto-rafraîchissement des exécutions
      const executionsIntervalId = setInterval(() => {
        if (activeTab === 'executions') {
          loadWorkflowExecutions(selectedWorkflow.id, false); // Silencieusement
        }
      }, config.refreshIntervals.executions);
      
      return () => clearInterval(executionsIntervalId);
    }
  }, [selectedWorkflow, activeTab]);

  // Chargement des workflows
  const loadWorkflows = useCallback(async (showToast: boolean = true) => {
    if (isLoading && showToast) return; // Éviter les requêtes parallèles
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getWorkflows();
      const data = response.data || [];
      setWorkflows(data);
      
      // Sélectionner le premier workflow par défaut
      if (data.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(data[0]);
      } else if (selectedWorkflow) {
        // Mettre à jour le workflow sélectionné
        const updated = data.find(w => w.id === selectedWorkflow.id);
        if (updated) setSelectedWorkflow(updated);
      }
      
      if (showToast) {
        toast({
          title: "Workflows actualisés",
          description: `${data.length} workflow(s) chargé(s) avec succès`
        });
      }
    } catch (error) {
      console.error("Failed to load workflows:", error);
      setError("Impossible de charger les workflows depuis n8n.");
      
      if (showToast) {
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les workflows depuis n8n.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [api, isLoading, selectedWorkflow]);

  // Chargement des exécutions pour un workflow
  const loadWorkflowExecutions = useCallback(async (workflowId: string, showToast: boolean = true) => {
    try {
      const response = await api.getWorkflowExecutions(workflowId);
      const data = response.data || [];
      setExecutions(data);
    } catch (error) {
      console.error("Failed to load executions:", error);
      if (showToast) {
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les exécutions du workflow.",
          variant: "destructive",
        });
      }
    }
  }, [api]);

  // Activer/désactiver un workflow
  const handleToggleActive = useCallback(async (workflow: Workflow) => {
    try {
      const updatedWorkflow = await api.toggleWorkflowActive(
        workflow.id,
        !workflow.active
      );
      
      setWorkflows(workflows => workflows.map(w => 
        w.id === updatedWorkflow.id ? updatedWorkflow : w
      ));

      if (selectedWorkflow?.id === updatedWorkflow.id) {
        setSelectedWorkflow(updatedWorkflow);
      }

      toast({
        title: updatedWorkflow.active ? "Workflow activé" : "Workflow désactivé",
        description: `Le workflow "${workflow.name}" a été ${updatedWorkflow.active ? "activé" : "désactivé"} avec succès.`,
      });
    } catch (error) {
      console.error(`Failed to toggle workflow ${workflow.id}:`, error);
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de modifier l'état du workflow.",
        variant: "destructive",
      });
    }
  }, [api, selectedWorkflow]);

  // Exécuter un workflow
  const executeWorkflow = useCallback(async (workflow: Workflow) => {
    setIsExecuting(true);
    setExecutingId(workflow.id);
    
    try {
      await api.executeWorkflow(workflow.id);
      
      toast({
        title: "Exécution lancée",
        description: `Le workflow "${workflow.name}" a été lancé avec succès.`,
      });
      
      // Recharger les exécutions après un court délai
      setTimeout(() => {
        loadWorkflowExecutions(workflow.id);
        setActiveTab('executions');
      }, 1000);
    } catch (error) {
      console.error(`Failed to execute workflow ${workflow.id}:`, error);
      toast({
        title: "Erreur d'exécution",
        description: "Impossible d'exécuter le workflow.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
      setExecutingId(null);
    }
  }, [api, loadWorkflowExecutions]);

  // Calculer la durée d'une exécution
  const calculateDuration = useCallback((startedAt: string, stoppedAt?: string) => {
    if (!stoppedAt) return "En cours...";
    
    const start = new Date(startedAt).getTime();
    const end = new Date(stoppedAt).getTime();
    const durationSec = Math.round((end - start) / 1000);
    
    if (durationSec < 60) {
      return `${durationSec} sec`;
    }
    
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;
    return `${minutes} min ${seconds} sec`;
  }, []);

  // Rendu optimisé avec useMemo pour les listes
  const workflowsList = useMemo(() => (
    <div className="space-y-2">
      {workflows.map((workflow) => (
        <WorkflowItem
          key={workflow.id}
          workflow={workflow}
          isSelected={selectedWorkflow?.id === workflow.id}
          onSelect={() => setSelectedWorkflow(workflow)}
          onToggle={() => handleToggleActive(workflow)}
          onExecute={() => executeWorkflow(workflow)}
          isExecuting={isExecuting && executingId === workflow.id}
        />
      ))}
    </div>
  ), [workflows, selectedWorkflow, isExecuting, executingId, handleToggleActive, executeWorkflow]);

  // Rendu des composants de chargement
  const loadingSkeletons = useMemo(() => (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-3 rounded-md border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-10" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  ), []);

  return (
    <TabsContext.Provider value={{ value: activeTab, onValueChange: setActiveTab }}>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestion des workflows n8n</CardTitle>
            <CardDescription>
              Gérez et contrôlez vos workflows d'automatisation SOS
            </CardDescription>
          </div>
          {error && (
            <Badge variant="destructive" className="flex gap-1 items-center">
              <AlertTriangle className="h-3 w-3" />
              Erreur de connexion
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="executions">Exécutions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="workflows" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Liste des workflows</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => loadWorkflows()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>

              {isLoading && workflows.length === 0 ? loadingSkeletons : null}

              {!isLoading && workflows.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <Info className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Aucun workflow trouvé dans votre instance n8n.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Créez un workflow dans n8n et il apparaîtra ici.
                  </p>
                </div>
              ) : workflowsList}
            </TabsContent>
            
            <TabsContent value="executions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">
                  {selectedWorkflow ? `Exécutions de "${selectedWorkflow.name}"` : "Sélectionnez un workflow"}
                </h3>
                
                {selectedWorkflow && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => loadWorkflowExecutions(selectedWorkflow.id)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Actualiser
                  </Button>
                )}
              </div>

              {!selectedWorkflow ? (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <p className="text-gray-500">
                    Sélectionnez un workflow pour voir ses exécutions
                  </p>
                </div>
              ) : executions.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <p className="text-gray-500">
                    Aucune exécution trouvée pour ce workflow
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {executions.map((execution) => (
                    <div key={execution.id} className="p-3 rounded-md border">
                      <div className="flex justify-between items-center">
                        <ExecutionStatus status={execution.status} />
                        <span className="text-xs text-gray-500">
                          {format(new Date(execution.startedAt), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">ID: </span>
                          <code className="bg-gray-100 rounded px-1 text-[10px]">{execution.id.substring(0, 8)}</code>
                        </div>
                        <div>
                          <span className="text-gray-500">Mode: </span>
                          <span>{execution.mode}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Durée: </span>
                          <span>{calculateDuration(execution.startedAt, execution.stoppedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TabsContext.Provider>
  );
}
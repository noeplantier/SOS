import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { useToast } from '../components/UseToast';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Separator } from '../components/Separator';

// Définir les types localement plutôt que d'importer depuis n8n-workflow
interface INodeParameters {
  [key: string]: any;
}

interface WorkflowExecuteData {
  workflowId: string;
  runData?: {
    [key: string]: any[];
  };
  startNodes?: string[];
  destinationNode?: string;
  workflowData?: {
    nodes: any[];
    connections: any;
  };
  sessionId?: string;
  pinData?: {
    [key: string]: any;
  };
}

export default function ExecutePage() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflowId, setWorkflowId] = useState<string>('');
  const [nodeParameters, setNodeParameters] = useState<INodeParameters>({});
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    if (router.isReady) {
      const { id, ...params } = router.query;
      if (id && typeof id === 'string') {
        setWorkflowId(id);
        
        // Convertir les paramètres d'URL en paramètres de nœud
        const parsedParams: INodeParameters = {};
        Object.entries(params).forEach(([key, value]) => {
          if (typeof value === 'string') {
            try {
              // Essayer de parser en tant que JSON si possible
              parsedParams[key] = JSON.parse(value);
            } catch (e) {
              // Sinon, utiliser la valeur telle quelle
              parsedParams[key] = value;
            }
          } else if (Array.isArray(value)) {
            parsedParams[key] = value[0]; // Prendre le premier élément si c'est un tableau
          }
        });
        
        setNodeParameters(parsedParams);
      }
    }
  }, [router.isReady, router.query]);

  const executeWorkflow = async () => {
    if (!workflowId) {
      toast({
        title: "Erreur d'exécution",
        description: "ID de workflow non spécifié",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_N8N_API_URL || 'http://localhost:5678';
      const executeUrl = `${apiUrl}/workflows/${workflowId}/execute`;

      // Préparer les données d'exécution
      const executeData: WorkflowExecuteData = {
        workflowId,
        // Pas besoin d'inclure runData sauf si vous avez des données spécifiques
      };

      // Si des paramètres sont définis, les ajouter
      if (Object.keys(nodeParameters).length > 0) {
        executeData.pinData = {
          // Utilise les paramètres pour le premier nœud du workflow
          // Vous pouvez ajuster cela selon votre structure de workflow
          'Start': {
            json: nodeParameters
          }
        };
      }

      const response = await fetch(executeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': process.env.NEXT_PUBLIC_N8N_API_KEY || '',
        },
        body: JSON.stringify(executeData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      toast({
        title: "Workflow exécuté",
        description: "Le workflow a été exécuté avec succès",
      });

      // Redirection ou autre action après exécution réussie
      setTimeout(() => {
        router.push('/n8n');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'exécution du workflow:', error);
      toast({
        title: "Erreur d'exécution",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Exécuter automatiquement si l'option est activée
  useEffect(() => {
    const autoExecute = router.query.autoExecute === 'true';
    
    if (workflowId && autoExecute && !isExecuting) {
      executeWorkflow();
    }
  }, [workflowId, router.query.autoExecute]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Exécution de workflow</CardTitle>
          <CardDescription>
            Exécuter le workflow n8n avec les paramètres fournis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">ID du workflow</h3>
              <p className="font-mono bg-gray-100 p-2 rounded">{workflowId || 'Non spécifié'}</p>
            </div>
            
            {Object.keys(nodeParameters).length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-2">Paramètres</h3>
                  <pre className="font-mono bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(nodeParameters, null, 2)}
                  </pre>
                </div>
              </>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/n8n')}
              >
                Annuler
              </Button>
              <Button
                onClick={executeWorkflow}
                disabled={isExecuting || !workflowId}
              >
                {isExecuting ? 'Exécution en cours...' : 'Exécuter le workflow'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../components/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { WorkflowManager } from '../components/WorkflowManager';
import { SOSButton } from '../components/SOSButton';
import { Separator } from '../components/Separator';
import { useToast } from '../components/UseToast';
import { Badge } from '../components/Badge';
import { useN8n } from '../lib/useN8n';
import { config } from '../lib/config';
import { Layout } from '../components/Layout';
import { Loader2, Settings, AlertCircle, Clock, RefreshCw } from 'lucide-react';

export default function N8nPage() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { n8nController, workflows, loadWorkflows, error } = useN8n();
  const { toast } = useToast();
  const router = useRouter();

  // Test de la connexion à n8n au chargement de la page
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        await loadWorkflows();
        setIsConnected(true);
        toast({
          title: "Connexion établie",
          description: "La connexion avec n8n a été établie avec succès",
        });
      } catch (error) {
        console.error("Erreur de connexion à n8n:", error);
        setIsConnected(false);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter à n8n. Vérifiez que le service est démarré.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion n8n</h1>
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Badge variant="outline" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Connexion en cours...
              </Badge>
            ) : isConnected ? (
              <Badge variant="success" className="gap-1">
                <Clock className="h-3 w-3" />
                Connecté à n8n
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Déconnecté
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => loadWorkflows()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="workflows">
          <TabsList className="mb-4">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="test">Test SOS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflows">
            {!isConnected && !isLoading ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Erreur de connexion
                  </CardTitle>
                  <CardDescription>
                    Impossible de se connecter au serveur n8n. Veuillez vérifier que le service est démarré et que les paramètres de configuration sont corrects.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    URL de l'API: <code className="bg-muted rounded px-1">{config.n8nApiUrl}</code>
                  </p>
                  <p className="text-sm">
                    Webhook SOS: <code className="bg-muted rounded px-1">{config.sosWebhookUrl}</code>
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => router.push('/config')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Modifier la configuration
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <WorkflowManager />
            )}
          </TabsContent>
          
          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Configuration n8n</CardTitle>
                <CardDescription>
                  Paramètres de connexion au serveur n8n
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-2">Paramètres actuels</h3>
                  <div className="bg-muted p-4 rounded-md overflow-auto">
                    <pre className="text-xs">
                      {JSON.stringify({
                        apiUrl: config.n8nApiUrl,
                        webhookUrl: config.sosWebhookUrl,
                        refreshIntervals: config.refreshIntervals,
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-2">État de la connexion</h3>
                  <p className="text-sm">
                    {isConnected 
                      ? "✅ Connecté au serveur n8n" 
                      : "❌ Non connecté au serveur n8n"}
                  </p>
                  <p className="text-sm mt-2">
                    {workflows.length} workflow(s) détecté(s)
                  </p>
                  {error && (
                    <p className="text-sm text-destructive mt-2">
                      Erreur: {error}
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-md font-medium mb-2">Liens utiles</h3>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href={`${config.n8nApiUrl.replace('/api/v1', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Interface n8n
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://docs.n8n.io/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Documentation n8n
                      </a>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="test">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test du bouton SOS</CardTitle>
                  <CardDescription>
                    Simulez l'activation d'un bouton SOS pour tester le workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                  <SOSButton 
                    vehicleId="VEHICLE_TEST_001"
                    driverName="Conducteur Test"
                    location="48.8566,2.3522"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Informations de test</CardTitle>
                  <CardDescription>
                    Données qui seront envoyées lors du test
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Véhicule ID</p>
                        <p>VEHICLE_TEST_001</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conducteur</p>
                        <p>Conducteur Test</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Localisation</p>
                        <p>48.8566,2.3522 (Paris)</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Webhook cible</p>
                      <code className="text-xs bg-muted p-1 rounded block overflow-x-auto">
                        {config.sosWebhookUrl}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
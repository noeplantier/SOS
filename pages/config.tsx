import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { useToast } from '../components/UseToast';
import { Separator } from '../components/Separator';
import { config as defaultConfig } from '../lib/config';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Check, Save, Undo, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function ConfigPage() {
  const [config, setConfig] = useState(defaultConfig);
  const [tempConfig, setTempConfig] = useState(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Charger la configuration depuis le localStorage au démarrage
  useEffect(() => {
    const savedConfig = localStorage.getItem('sos-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        setTempConfig(parsedConfig);
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration:", error);
        toast({
          title: "Erreur de configuration",
          description: "Impossible de charger la configuration sauvegardée.",
          variant: "destructive",
        });
      }
    }
  }, []);

  // Détecter les changements
  useEffect(() => {
    const configChanged = JSON.stringify(config) !== JSON.stringify(tempConfig);
    setHasChanges(configChanged);
  }, [config, tempConfig]);

  // Enregistrer la configuration
  const saveConfig = () => {
    try {
      localStorage.setItem('sos-config', JSON.stringify(tempConfig));
      setConfig(tempConfig);
      
      // Définir les variables d'environnement côté client
      if (typeof window !== 'undefined') {
        (window as any).process = {
          ...(window as any).process,
          env: {
            ...(window as any).process?.env,
            NEXT_PUBLIC_N8N_API_URL: tempConfig.n8nApiUrl,
            NEXT_PUBLIC_N8N_API_KEY: tempConfig.n8nApiKey,
            NEXT_PUBLIC_SOS_WEBHOOK_URL: tempConfig.sosWebhookUrl,
          },
        };
      }
      
      toast({
        title: "Configuration enregistrée",
        description: "Les paramètres ont été mis à jour avec succès.",
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la configuration:", error);
      toast({
        title: "Erreur d'enregistrement",
        description: "Impossible d'enregistrer la configuration.",
        variant: "destructive",
      });
    }
  };

  // Réinitialiser la configuration
  const resetConfig = () => {
    setTempConfig(config);
    toast({
      title: "Modifications annulées",
      description: "Les modifications non enregistrées ont été annulées.",
    });
  };

  // Restaurer les paramètres par défaut
  const restoreDefaults = () => {
    setTempConfig(defaultConfig);
    toast({
      title: "Valeurs par défaut restaurées",
      description: "La configuration a été réinitialisée aux valeurs par défaut. N'oubliez pas d'enregistrer.",
    });
  };

  // Mettre à jour un champ de configuration
  const updateConfig = (path: string[], value: any) => {
    setTempConfig((prev) => {
      const newConfig = { ...prev };
      let current = newConfig;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i] as keyof typeof current] as any;
      }
      
      const lastKey = path[path.length - 1];
      current[lastKey as keyof typeof current] = value;
      
      return newConfig;
    });
  };

  // Tester la connexion à n8n
  const testConnection = async () => {
    try {
      const response = await fetch(tempConfig.n8nApiUrl, {
        headers: {
          'X-N8N-API-KEY': tempConfig.n8nApiKey
        }
      });
      
      if (response.ok) {
        toast({
          title: "Connexion réussie",
          description: "La connexion avec n8n a été établie avec succès.",
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: `Échec de la connexion (${response.status}): ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur de test de connexion:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur n8n. Vérifiez l'URL et la clé API.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Configuration</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <Button
              variant="outline"
              onClick={resetConfig}
              disabled={!hasChanges}
            >
              <Undo className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            
            <Button
              variant="default"
              onClick={saveConfig}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </div>

        <Tabs defaultValue="n8n">
          <TabsList className="mb-4">
            <TabsTrigger value="n8n">Configuration n8n</TabsTrigger>
            <TabsTrigger value="alerts">Configuration des alertes</TabsTrigger>
            <TabsTrigger value="advanced">Paramètres avancés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="n8n">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de connexion n8n</CardTitle>
                <CardDescription>
                  Configurez la connexion à votre instance n8n
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="n8nApiUrl">URL de l'API n8n</Label>
                    <Input
                      id="n8nApiUrl"
                      placeholder="http://localhost:5678/api/v1"
                      value={tempConfig.n8nApiUrl}
                      onChange={(e) => updateConfig(['n8nApiUrl'], e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      L'URL de base de l'API n8n, généralement se terminant par /api/v1
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="n8nApiKey">Clé API n8n</Label>
                    <Input
                      id="n8nApiKey"
                      type="password"
                      placeholder="Votre clé API n8n"
                      value={tempConfig.n8nApiKey}
                      onChange={(e) => updateConfig(['n8nApiKey'], e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      La clé API pour authentifier les requêtes à n8n
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sosWebhookUrl">URL du webhook SOS</Label>
                    <Input
                      id="sosWebhookUrl"
                      placeholder="http://localhost:5678/webhook/sos"
                      value={tempConfig.sosWebhookUrl}
                      onChange={(e) => updateConfig(['sosWebhookUrl'], e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      L'URL du webhook qui recevra les alertes SOS
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <Button onClick={testConnection}>
                      <Check className="h-4 w-4 mr-2" />
                      Tester la connexion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des alertes</CardTitle>
                <CardDescription>
                  Paramètres des types d'alertes et des intervalles de rafraîchissement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Intervalles de rafraîchissement</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="refreshWorkflows">Workflows (ms)</Label>
                      <Input
                        id="refreshWorkflows"
                        type="number"
                        value={tempConfig.refreshIntervals.workflows}
                        onChange={(e) => updateConfig(['refreshIntervals', 'workflows'], parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="refreshExecutions">Exécutions (ms)</Label>
                      <Input
                        id="refreshExecutions"
                        type="number"
                        value={tempConfig.refreshIntervals.executions}
                        onChange={(e) => updateConfig(['refreshIntervals', 'executions'], parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="refreshAlerts">Alertes (ms)</Label>
                      <Input
                        id="refreshAlerts"
                        type="number"
                        value={tempConfig.refreshIntervals.alerts}
                        onChange={(e) => updateConfig(['refreshIntervals', 'alerts'], parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Types d'alertes</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Configuration des types d'alertes disponibles dans l'application
                    </p>
                    
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">ID</th>
                            <th className="p-2 text-left">Nom</th>
                            <th className="p-2 text-left">Couleur</th>
                            <th className="p-2 text-left">Icône</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tempConfig.alerts.types.map((type, index) => (
                            <tr key={type.id} className="border-t">
                              <td className="p-2">{type.id}</td>
                              <td className="p-2">
                                <Input 
                                  value={type.name}
                                  onChange={(e) => {
                                    const newTypes = [...tempConfig.alerts.types];
                                    newTypes[index].name = e.target.value;
                                    updateConfig(['alerts', 'types'], newTypes);
                                  }}
                                />
                              </td>
                              <td className="p-2">
                                <Input 
                                  value={type.color}
                                  onChange={(e) => {
                                    const newTypes = [...tempConfig.alerts.types];
                                    newTypes[index].color = e.target.value;
                                    updateConfig(['alerts', 'types'], newTypes);
                                  }}
                                />
                              </td>
                              <td className="p-2">
                                <Input 
                                  value={type.icon}
                                  onChange={(e) => {
                                    const newTypes = [...tempConfig.alerts.types];
                                    newTypes[index].icon = e.target.value;
                                    updateConfig(['alerts', 'types'], newTypes);
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres avancés</CardTitle>
                <CardDescription>
                  Configuration avancée du système SOS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sosApiUrl">URL de l'API SOS</Label>
                  <Input
                    id="sosApiUrl"
                    placeholder="http://localhost:3001/api"
                    value={tempConfig.sosApi.baseUrl}
                    onChange={(e) => updateConfig(['sosApi', 'baseUrl'], e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Points de terminaison de l'API</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(tempConfig.sosApi.endpoints).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`endpoint-${key}`}>{key}</Label>
                        <Input
                          id={`endpoint-${key}`}
                          value={value as string}
                          onChange={(e) => {
                            const newEndpoints = { ...tempConfig.sosApi.endpoints };
                            newEndpoints[key as keyof typeof newEndpoints] = e.target.value;
                            updateConfig(['sosApi', 'endpoints'], newEndpoints);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Réinitialiser aux valeurs par défaut
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action réinitialisera toutes vos configurations personnalisées aux valeurs par défaut. 
                          Cette opération ne peut pas être annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={restoreDefaults}>
                          Réinitialiser
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Les modifications des paramètres avancés peuvent nécessiter un redémarrage de l'application.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
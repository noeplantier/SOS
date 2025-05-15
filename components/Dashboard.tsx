"use client";

import { useState } from "react";
import { SOSButton } from "../components/SOSButton";
import { WorkflowManager } from "../components/WorkflowManager";
import { Toaster } from "../components/Toaster";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";

export default function Dashboard() {
  const [lastAlert, setLastAlert] = useState<any>(null);
  
  // Exemple de données conducteur (normalement chargées depuis l'API)
  const driverInfo = {
    id: "driver_123",
    name: "Jean Dupont",
    vehicleId: "VEH_456",
    vehicleType: "Transport exceptionnel"
  };

  const handleSOSActivate = (data: any) => {
    setLastAlert(data);
    // Ici, vous pourriez également enregistrer l'alerte localement ou effectuer d'autres actions
  };

  return (
    <>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">SOS - Système d'Alerte pour Transports Exceptionnels</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Appel d'Urgence</CardTitle>
              <CardDescription>
                Déclenchez une alerte SOS en cas d'urgence
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <SOSButton 
                vehicleId={driverInfo.vehicleId}
                driverName={driverInfo.name}
                onActivate={handleSOSActivate}
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations conducteur</CardTitle>
              <CardDescription>
                Détails sur le conducteur et le véhicule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nom du conducteur</p>
                    <p>{driverInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID conducteur</p>
                    <p>{driverInfo.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID véhicule</p>
                    <p>{driverInfo.vehicleId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type de véhicule</p>
                    <p>{driverInfo.vehicleType}</p>
                  </div>
                </div>
                
                {lastAlert && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="font-medium text-amber-800">Dernière alerte envoyée:</p>
                    <p className="text-sm text-amber-700">Type: {lastAlert.emergencyType}</p>
                    <p className="text-sm text-amber-700">Heure: {new Date(lastAlert.timestamp).toLocaleString()}</p>
                    <p className="text-sm text-amber-700">Priorité: {lastAlert.priority}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="workflows" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="workflows">Gestion des workflows</TabsTrigger>
            <TabsTrigger value="contacts">Contacts d'urgence</TabsTrigger>
            <TabsTrigger value="history">Historique des alertes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflows">
            <WorkflowManager />
          </TabsContent>
          
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contacts d'urgence</CardTitle>
                <CardDescription>
                  Liste des contacts qui seront notifiés en cas d'alerte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Fonctionnalité en cours de développement
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des alertes</CardTitle>
                <CardDescription>
                  Journal des alertes SOS déclenchées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Fonctionnalité en cours de développement
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </>
  );
}
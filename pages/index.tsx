import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { SOSButton } from '../components/SOSButton';
import { AlertCircle, Activity, Settings, Users, Truck, Shield, Heart, Clock, Bell, RefreshCw } from 'lucide-react';
import { useToast } from '../components/UseToast';
import { config } from '../lib/config';
import { pages } from 'next/dist/build/templates/app-page';

// Données pour les widgets de statistiques
const statsData = [
  { id: 1, title: 'Véhicules actifs', value: '24', icon: Truck, color: 'blue' },
  { id: 2, title: 'Alertes aujourd\'hui', value: '3', icon: Bell, color: 'amber' },
  { id: 3, title: 'Temps de réponse moyen', value: '4min', icon: Clock, color: 'green' },
  { id: 4, title: 'Équipes disponibles', value: '8', icon: Users, color: 'indigo' },
];

// Données pour les alertes récentes
const recentAlerts = [
  { 
    id: 'a1', 
    type: 'security', 
    vehicleId: 'VH-1024', 
    timestamp: '2023-05-16T09:45:23Z', 
    status: 'resolved',
    driver: 'Jean Dupont'
  },
  { 
    id: 'a2', 
    type: 'medical', 
    vehicleId: 'VH-973', 
    timestamp: '2023-05-16T08:12:05Z', 
    status: 'in_progress',
    driver: 'Marie Martin'
  },
  { 
    id: 'a3', 
    type: 'technical', 
    vehicleId: 'VH-651', 
    timestamp: '2023-05-15T22:37:41Z', 
    status: 'resolved',
    driver: 'Luc Bernard'
  },
];

// Traduire les types d'alerte
const alertTypeMap = {
  security: { name: 'Sécurité', icon: Shield, color: 'amber' },
  medical: { name: 'Médicale', icon: Heart, color: 'red' },
  technical: { name: 'Technique', icon: Settings, color: 'blue' },
};

// Traduire les statuts d'alerte
const alertStatusMap = {
  resolved: { name: 'Résolu', className: 'badge badge-success' },
  in_progress: { name: 'En cours', className: 'badge badge-warning' },
  pending: { name: 'En attente', className: 'badge badge-info' },
};

// Formater la date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function HomePage() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<'online' | 'degraded' | 'offline'>('online');
  const router = useRouter();
  const { toast } = useToast();

  // Vérifier le statut du système
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Simulation d'une vérification d'API
        // Dans un environnement réel, remplacez par un vrai appel API
        const response = await fetch(`${config.n8nApiUrl}/status`).catch(() => ({ ok: false }));
        
        if (response.ok) {
          setSystemStatus('online');
        } else {
          setSystemStatus('degraded');
          
          toast({
            title: "Connectivité limitée",
            description: "Le système fonctionne en mode dégradé. Certaines fonctionnalités peuvent être indisponibles.",
            variant: "default",
          });
        }
      } catch (error) {
        setSystemStatus('offline');
        
        toast({
          title: "Système hors ligne",
          description: "Impossible de se connecter au serveur. Veuillez vérifier votre connexion.",
          variant: "destructive",
        });
      }
    };
    
    checkSystemStatus();
    
    // Vérifier toutes les 60 secondes
    const intervalId = setInterval(checkSystemStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, [toast]);

  // Simuler le rafraîchissement des données
  const refreshData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastRefresh(new Date());
      
      toast({
        title: "Données actualisées",
        description: "Les informations ont été mises à jour avec succès.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible d'actualiser les données. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <Head>
        <title>SOS - Système d'Alerte d'Urgence</title>
        <meta name="description" content="Système d'alerte d'urgence pour la gestion des situations critiques" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-bg-secondary">
        {/* Barre de navigation */}
        <nav className="navbar">
          <div className="container flex justify-between items-center">
            <Link href="/" className="navbar-brand">
              SOS
            </Link>
            
            <div className="navbar-links">
              <Link href="/n8n" className="navbar-link">
                Workflows
              </Link>
              <Link href="/alerts" className="navbar-link">
                Alertes
              </Link>
              <Link href="/config" className="navbar-link">
                Configuration
              </Link>
              
              {/* Indicateur de statut du système */}
              <div className="tooltip">
                <div className={`h-3 w-3 rounded-full ${
                  systemStatus === 'online' ? 'bg-success' : 
                  systemStatus === 'degraded' ? 'bg-warning' : 'bg-error'
                }`}></div>
                <div className="tooltip-content">
                  {systemStatus === 'online'
                    ? 'Système en ligne'
                    : systemStatus === 'degraded'
                    ? 'Système en mode dégradé'
                    : 'Système hors ligne'}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="container section">
          {/* En-tête de page avec bouton de rafraîchissement */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Tableau de bord</h1>
              <p className="text-text-secondary">
                Vue d'ensemble du système d'alerte d'urgence
              </p>
            </div>
            <div className="flex items-center gap-md">
              <div className="text-sm text-text-tertiary">
                Dernière mise à jour: {formatDate(lastRefresh.toISOString())}
              </div>
              <button 
                className={`btn btn-ghost btn-icon ${isRefreshing ? 'animate-spin' : ''}`}
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Widgets de statistiques */}
          <div className="dashboard-grid mb-8">
            {statsData.map(stat => (
              <div key={stat.id} className="card">
                <div className="card-content">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-text-secondary text-sm mb-1">{stat.title}</p>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section principale avec alertes et bouton SOS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Alertes récentes - occupe 2 colonnes sur grand écran */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h2 className="card-title">Alertes récentes</h2>
                    <Link href="/alerts">
                      <span className="text-sm text-blue-600 hover:underline">Voir toutes</span>
                    </Link>
                  </div>
                </div>
                <div className="card-content">
                  {recentAlerts.length === 0 ? (
                    <div className="text-center p-8">
                      <Activity className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
                      <p className="text-text-secondary">Aucune alerte récente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentAlerts.map(alert => {
                        const type = alertTypeMap[alert.type as keyof typeof alertTypeMap];
                        const status = alertStatusMap[alert.status as keyof typeof alertStatusMap];
                        const AlertIcon = type.icon;
                        
                        return (
                          <div key={alert.id} className="flex items-center p-4 border rounded-lg hover:bg-bg-tertiary transition-colors">
                            <div className={`p-2 rounded-full bg-${type.color}-100 mr-4`}>
                              <AlertIcon className={`h-6 w-6 text-${type.color}-600`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className="font-medium">{type.name} - {alert.vehicleId}</h3>
                                <span className={status.className}>{status.name}</span>
                              </div>
                              <div className="flex justify-between text-sm text-text-secondary mt-1">
                                <span>{alert.driver}</span>
                                <span>{formatDate(alert.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Zone du bouton SOS - occupe 1 colonne sur grand écran */}
            <div>
              <div className="card h-full">
                <div className="card-header">
                  <h2 className="card-title">Alerte d'urgence</h2>
                  <p className="card-description">Utilisez ce bouton en cas de situation critique</p>
                </div>
                <div className="card-content flex flex-col items-center justify-center py-8">
                  <SOSButton 
                    vehicleId="VH-ADMIN"
                    driverName="Administrateur"
                    onActivate={(data) => {
                      toast({
                        title: "Alerte déclenchée",
                        description: `Alerte ${data.emergencyType} envoyée aux équipes d'intervention.`,
                        variant: "default",
                      });
                    }}
                  />
                  <p className="text-center mt-4 text-sm text-text-secondary max-w-xs">
                    En appuyant sur ce bouton, vous déclenchez une alerte qui sera transmise immédiatement aux équipes d'intervention.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section des actions rapides */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/n8n">
                <div className="card text-center p-4 hover:bg-bg-tertiary transition-colors cursor-pointer">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">Workflows</h3>
                </div>
              </Link>
              
              <Link href="/config">
                <div className="card text-center p-4 hover:bg-bg-tertiary transition-colors cursor-pointer">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <h3 className="font-medium">Configuration</h3>
                </div>
              </Link>
              
              <Link href="/vehicles">
                <div className="card text-center p-4 hover:bg-bg-tertiary transition-colors cursor-pointer">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium">Véhicules</h3>
                </div>
              </Link>
              
              <Link href="/teams">
                <div className="card text-center p-4 hover:bg-bg-tertiary transition-colors cursor-pointer">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-medium">Équipes</h3>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <footer className="bg-bg-tertiary py-8 mt-16">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-primary">SOS</h2>
                <p className="text-sm text-text-secondary">
                  Système d'Alerte d'Urgence
                </p>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-sm text-text-secondary">
                  &copy; 2023 SOS. Tous droits réservés.
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  Version 1.0.0
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
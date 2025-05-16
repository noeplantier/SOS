import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { Bell, Truck, Shield, Heart, Settings, Activity, Clock, Users, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react';
import { config } from '../config';

// Types pour les données
interface StatsData {
  id: string;
  title: string;
  value: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

interface Alert {
  id: string;
  type: 'medical' | 'security' | 'technical';
  vehicleId: string;
  driverName: string;
  timestamp: string;
  status: 'resolved' | 'in_progress' | 'pending';
  location?: string;
}

interface ActionLink {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  href: string;
}

// Données pour les statistiques
const statsData: StatsData[] = [
  {
    id: 'active-vehicles',
    title: 'Véhicules actifs',
    value: '24',
    icon: Truck,
    color: 'blue'
  },
  {
    id: 'todays-alerts',
    title: 'Alertes aujourd\'hui',
    value: '3',
    icon: Bell,
    color: 'amber'
  },
  {
    id: 'response-time',
    title: 'Temps moyen de réponse',
    value: '4min',
    icon: Clock,
    color: 'green'
  },
  {
    id: 'teams',
    title: 'Équipes disponibles',
    value: '8',
    icon: Users,
    color: 'indigo'
  }
];

// Données pour les alertes récentes
const recentAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'security',
    vehicleId: 'VH-1024',
    driverName: 'Jean Dupont',
    timestamp: '2023-05-16T09:45:23Z',
    status: 'resolved',
    location: 'Paris, 9ème arr.'
  },
  {
    id: 'alert-2',
    type: 'medical',
    vehicleId: 'VH-973',
    driverName: 'Marie Martin',
    timestamp: '2023-05-16T08:12:05Z',
    status: 'in_progress',
    location: 'Lyon, Centre'
  },
  {
    id: 'alert-3',
    type: 'technical',
    vehicleId: 'VH-651',
    driverName: 'Luc Bernard',
    timestamp: '2023-05-15T22:37:41Z',
    status: 'pending',
    location: 'Marseille, Port'
  }
];

// Actions rapides
const quickActions: ActionLink[] = [
  {
    id: 'workflows',
    title: 'Workflows',
    icon: Activity,
    color: 'blue',
    href: '/n8n'
  },
  {
    id: 'config',
    title: 'Configuration',
    icon: Settings,
    color: 'gray',
    href: '/config'
  },
  {
    id: 'vehicles',
    title: 'Véhicules',
    icon: Truck,
    color: 'green',
    href: '/vehicles'
  },
  {
    id: 'teams',
    title: 'Équipes',
    icon: Users,
    color: 'purple',
    href: '/teams'
  }
];

// Mappages pour affichage
const alertTypeMap = {
  security: {
    name: 'Sécurité',
    icon: Shield,
    color: 'amber',
    class: styles.security
  },
  medical: {
    name: 'Médicale',
    icon: Heart,
    color: 'red',
    class: styles.medical
  },
  technical: {
    name: 'Technique',
    icon: Settings,
    color: 'blue',
    class: styles.technical
  }
};

const alertStatusMap = {
  resolved: {
    name: 'Résolu',
    class: styles.resolved
  },
  in_progress: {
    name: 'En cours',
    class: styles.inProgress
  },
  pending: {
    name: 'En attente',
    class: styles.pending
  }
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

  // Vérifier le statut du système
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Simulation d'une vérification d'API
        const response = await fetch(`${config.n8nApiUrl}/health`, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(() => ({ ok: false }));
        
        if (response.ok) {
          setSystemStatus('online');
        } else {
          setSystemStatus('degraded');
          showToast('Connectivité limitée', 'Le système fonctionne en mode dégradé.', 'warning');
        }
      } catch (error) {
        setSystemStatus('offline');
        showToast('Système hors ligne', 'Impossible de se connecter au serveur.', 'error');
      }
    };
    
    checkSystemStatus();
    
    // Vérifier toutes les 60 secondes
    const intervalId = setInterval(checkSystemStatus, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Simuler le rafraîchissement des données
  const refreshData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
      showToast('Données actualisées', 'Les informations ont été mises à jour avec succès.', 'success');
    } catch (error) {
      showToast('Erreur de synchronisation', 'Impossible d\'actualiser les données.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fonction simple pour afficher une notification toast
  const showToast = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    // Dans une implémentation réelle, vous utiliseriez un système de notification
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    
    // Vous pourriez implémenter ici une bibliothèque comme react-toastify ou créer votre propre système
  };

  // Fonction pour déclencher une alerte SOS
  const handleSOSClick = () => {
    router.push('/emergency');
  };

  return (
    <div className={styles.homePage}>
      <Head>
        <title>SOS - Système d'Alerte d'Urgence</title>
        <meta name="description" content="Système d'alerte d'urgence pour la gestion des situations critiques" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Barre de navigation */}
      <header className="navbar">
        <div className="container flex justify-between items-center">

          <div className="navbar-links">
            
            {/* Indicateur de statut du système */}
            <div className={styles.tooltip}>
              <div className={`${styles.statusDot} ${styles[systemStatus]}`}></div>
              <span className={styles.tooltipText}>
                {systemStatus === 'online' ? 'Système en ligne' : 
                systemStatus === 'degraded' ? 'Système dégradé' : 'Système hors ligne'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}></div>
          <div className="container">
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Système SOS d'Alerte d'Urgence</h1>
              <p className={styles.heroSubtitle}>
                Plateforme de gestion centralisée des alertes et des interventions d'urgence
              </p>
              <button 
                className={styles.primaryButton} 
                onClick={() => router.push('/emergency')}
              >
                Accéder au centre d'urgence
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className="container">
            <div className={styles.statsGrid}>
              {statsData.map(stat => (
                <div key={stat.id} className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div>
                      <div className={styles.statTitle}>{stat.title}</div>
                      <div className={styles.statValue}>{stat.value}</div>
                    </div>
                    <div className={`${styles.statIcon} bg-${stat.color}-100`}>
                      <stat.icon className={`text-${stat.color}-600`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alerts Section */}
        <section className={styles.alertsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Alertes récentes</h2>
              <Link href="/alerts" className={styles.viewAllLink}>
                Voir toutes <ArrowRight size={16} />
              </Link>
            </div>

            {recentAlerts.length === 0 ? (
              <div className="card p-8 text-center">
                <AlertTriangle className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500">Aucune alerte récente</p>
              </div>
            ) : (
              <div className={styles.alertsGrid}>
                {recentAlerts.map(alert => {
                  const typeInfo = alertTypeMap[alert.type];
                  const statusInfo = alertStatusMap[alert.status];
                  const AlertIcon = typeInfo.icon;
                  
                  return (
                    <div 
                      key={alert.id} 
                      className={`${styles.alertCard} ${typeInfo.class}`}
                      onClick={() => router.push(`/alerts/${alert.id}`)}
                    >
                      <div className={`${styles.alertIconWrapper} ${typeInfo.class}`}>
                        <AlertIcon />
                      </div>
                      
                      <div className={styles.alertContent}>
                        <div className={styles.alertHeader}>
                          <div className={styles.alertType}>
                            {typeInfo.name} - {alert.vehicleId}
                          </div>
                          <div className={`${styles.alertStatus} ${statusInfo.class}`}>
                            {statusInfo.name}
                          </div>
                        </div>
                        
                        <div className={styles.alertMeta}>
                          <span>{alert.driverName}</span>
                          <span>{formatDate(alert.timestamp)}</span>
                        </div>
                        
                        {alert.location && (
                          <div className="text-xs text-gray-500 mt-2">
                            📍 {alert.location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Actions Section */}
        <section className="section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Actions rapides</h2>
            </div>
            
            <div className={styles.actionsGrid}>
              {quickActions.map(action => (
                <Link href={action.href} key={action.id}>
                  <div className={styles.actionCard}>
                    <div className={`${styles.actionIcon} bg-${action.color}-100`}>
                      <action.icon className={`text-${action.color}-600`} />
                    </div>
                    <h3 className={styles.actionTitle}>{action.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SOS Section */}
        <section className={styles.sosSection}>
          <div className="container">
            <div className={styles.sosContainer}>
              <h2 className={styles.sosTitle}>Déclenchement d'urgence</h2>
              <p className={styles.sosDescription}>
                En cas de situation critique, appuyez sur le bouton SOS pour déclencher une alerte d'urgence et mobiliser immédiatement les équipes d'intervention.
              </p>
              
              <button 
                className={styles.sosButton}
                onClick={handleSOSClick}
                aria-label="Déclencher une alerte SOS"
              >
                SOS
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>SOS</div>
              <div className={styles.footerTagline}>
                Système d'Alerte d'Urgence
              </div>
            </div>
            
            <div className={styles.footerCopyright}>
              <div className={styles.copyrightText}>
                &copy; {new Date().getFullYear()} SOS. Tous droits réservés.
              </div>
              <div className={styles.versionText}>
                Version 1.0.0
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
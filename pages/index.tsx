import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { 
  Bell, Truck, Shield, Heart, Settings, Activity, Clock, 
  Users, ArrowRight, AlertTriangle, Zap, Radio, CheckCircle,
  Info, X, RefreshCw
} from 'lucide-react';
import { config } from '../config';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Emergency from '../components/Emergency';

// Types
type SystemStatus = 'online' | 'degraded' | 'offline';
type AlertType = 'medical' | 'security' | 'technical';
type AlertStatus = 'resolved' | 'in_progress' | 'pending';
type ToastType = 'success' | 'warning' | 'error' | 'info';

// Interfaces
interface StatsData {
  id: string;
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

interface Alert {
  id: string;
  type: AlertType;
  vehicleId: string;
  driverName: string;
  timestamp: string;
  status: AlertStatus;
  location?: string;
}

interface ActionLink {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  href: string;
}

interface SystemBenefit {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  backgroundColor: string;
  selectable?: boolean;
}

// Données constantes (extraites pour optimisation)
const statsData: StatsData[] = [
  {
    id: 'active-vehicles',
    title: 'Véhicules actifs',
    value: '24',
    icon: Truck,
    color: 'blue'
  },
  {
    id: 'teams',
    title: 'Équipes disponibles',
    value: '8',
    icon: Users,
    color: 'indigo'
  },
  {
    id: 'critical-alerts',
    title: 'Alertes critiques',
    value: '1',
    icon: AlertTriangle,
    color: 'red'
  },
  {
    id: 'system-uptime',
    title: 'Disponibilité système',
    value: '99.8%',
    icon: Activity,
    color: 'emerald'
  }
];

const systemBenefits: SystemBenefit[] = [
  {
    id: 'benefit-1',
    title: 'Réponse Rapide',
    description: 'Interventions d\'urgence accélérées grâce à notre système de notification instantanée.',
    icon: Zap,
    color: '#e63946',
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
    selectable: true
  },
  {
    id: 'benefit-2',
    title: 'Coordination Centralisée',
    description: 'Interface unifiée permettant une gestion globale des alertes.',
    icon: Radio, 
    color: '#457b9d',
    backgroundColor: 'rgba(69, 123, 157, 0.1)',
    selectable: true
  },
  {
    id: 'benefit-3',
    title: 'Haute Fiabilité',
    description: 'Système redondant avec une disponibilité intégrale garantissant un fonctionnement continu.',
    icon: CheckCircle,
    color: '#2a9d8f',
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    selectable: true
  }
];

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

// Fonction utilitaire pour le formatage des dates (extraite pour éviter les recréations)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default function HomePage() {
  // États
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('online');
  const [isSOSPulsing, setIsSOSPulsing] = useState<boolean>(false);
  const [selectedCards, setSelectedCards] = useState<Record<string, boolean>>({});
  
  // Hooks
  const router = useRouter();

  // Vérification du statut du système
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch(`${config.n8nApiUrl}/health`, { 
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' }
        }).catch(() => ({ ok: false }));
        
        const newStatus = response.ok ? 'online' : 'degraded';
        
        if (newStatus !== systemStatus) {
          setSystemStatus(newStatus);
          if (!response.ok) {
            showToast('Connectivité limitée', 'Le système fonctionne en mode dégradé.', 'warning');
          } else if (systemStatus !== 'online') {
            showToast('Système en ligne', 'La connexion au système a été rétablie.', 'success');
          }
        }
      } catch (error) {
        if (systemStatus !== 'offline') {
          setSystemStatus('offline');
          showToast('Système hors ligne', 'Impossible de se connecter au serveur.', 'error');
        }
      }
    };

    // Vérification initiale
    checkSystemStatus();
    
    // Vérifications périodiques
    const intervalId = setInterval(checkSystemStatus, 60000);
    
    // Nettoyage
    return () => clearInterval(intervalId);
  }, [systemStatus]);

  // Actions
  const refreshData = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      // Simulation du chargement (à remplacer par de vraies requêtes API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastRefresh(new Date());
      showToast('Données actualisées', 'Les informations ont été mises à jour avec succès.', 'success');
    } catch (error) {
      showToast('Erreur de synchronisation', 'Impossible d\'actualiser les données.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const showToast = useCallback((title: string, message: string, type: ToastType) => {
    // Utilisation de la fonction globale window.showToast si disponible
    if (typeof window !== 'undefined' && 'showToast' in window) {
      (window as any).showToast(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    }
  }, []);

  const handleCardSelection = useCallback((cardId: string) => {
    setSelectedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  }, []);

  const handleSOSClick = useCallback(() => {
    setIsSOSPulsing(true);
    
    setTimeout(() => {
      setIsSOSPulsing(false);
      router.push('/alert');
    }, 800);
  }, [router]);

  // Memo pour éviter les re-rendus inutiles
  const formattedLastRefresh = useMemo(() => {
    return lastRefresh.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [lastRefresh]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.homePage}>
        <Head>
          <title>SOS - SYSTEME D'ALERTE D'URGENCE</title>
          <meta name="description" content="Système d'alerte d'urgence pour la gestion des situations critiques" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/favicon.ico" />
        </Head>



        <main className={styles.mainContent}>
          <section className={styles.hero}>
            <div className={styles.heroBackground}></div>
            <div className={styles.container}>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>SYSTEME D'ALERTE D'URGENCE</h1>
                <h2 className={styles.heroSubtitle}>
                  PLATEFORME D'ALERTES CENTRALISÉES 
                </h2>

                <section className={styles.sosSection}>
                  <div className={styles.sosContainer}>
                    <button
                      className={`${styles.sosButton} ${isSOSPulsing ? styles.pulsing : ''}`}
                      onClick={handleSOSClick}
                      aria-label="Déclencher une alerte SOS"
                    >
                      SOS
                    </button>
                  </div>
                </section>

                {/* Tilted Cards React Bits */}
                <section className={styles.tiltedCardsSection}>
                  <div className={styles.tiltedCardsContainer}>
                    {systemBenefits.map((benefit, index) => {
                      const isSelected = benefit.selectable && selectedCards[benefit.id];
                      
                      return (
                        <div 
                          key={benefit.id}
                          className={`${styles.tiltedCard} ${isSelected ? styles.selected : ''}`}
                          onClick={() => benefit.selectable && handleCardSelection(benefit.id)}
                          style={{
                            '--card-rotation': `${(index - 1) * 2}deg`,
                            '--card-scale': index === 1 ? '1.05' : '1',
                            '--card-z-index': index === 1 ? '2' : '1',
                            cursor: benefit.selectable ? 'pointer' : 'default'
                          } as React.CSSProperties}
                        >
                          <div className={styles.tiltedCardInner}>
                            <div 
                              className={styles.tiltedCardIconWrapper}
                              style={{ backgroundColor: benefit.backgroundColor }}
                            >
                              {React.createElement(benefit.icon, { 
                                size: 32, 
                                color: benefit.color,
                                strokeWidth: 2
                              })}
                            </div>
                            <h3 className={styles.tiltedCardTitle}>{benefit.title}</h3>
                            <p className={styles.tiltedCardDescription}>{benefit.description}</p>
                            
                            {/* Indicateur de sélection */}
                            {isSelected && (
                              <div className={styles.selectedIndicator}>
                                <CheckCircle size={24} />
                              </div>
                            )}
                            
                            <div className={styles.tiltedCardShine}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          </section>


          {/* Composant Emergency */}
          <Emergency />
        </main>
        


          {/* Alertes récentes */}
          <section className={styles.alertsSection}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Alertes récentes</h2>
                <button className={styles.viewAllButton}>
                  Voir toutes <ArrowRight size={16} />
                </button>
              </div>
              
              <div className={styles.alertsList}>
                {recentAlerts.map(alert => {
                  const alertType = alertTypeMap[alert.type];
                  const alertStatus = alertStatusMap[alert.status];
                  const AlertIcon = alertType.icon;
                  
                  return (
                    <div key={alert.id} className={styles.alertCard}>
                      <div className={`${styles.alertIconWrapper} ${alertType.class}`}>
                        <AlertIcon size={24} />
                      </div>
                      <div className={styles.alertContent}>
                        <div className={styles.alertHeader}>
                          <div className={styles.alertType}>{alertType.name}</div>
                          <div className={`${styles.alertStatus} ${alertStatus.class}`}>
                            {alertStatus.name}
                          </div>
                        </div>
                        <p className={styles.alertDescription}>
                          {alert.driverName} - {alert.location}
                        </p>
                        <div className={styles.alertMeta}>
                          <span className={styles.alertTime}>{formatDate(alert.timestamp)}</span>
                          <span className={styles.vehicleId}>{alert.vehicleId}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>


        <footer className={styles.footer}>
          <div className={styles.container}>
            <div className={styles.footerContent}>
              <div className={styles.footerInfo}>
                © {new Date().getFullYear()} Système d'Alerte d'Urgence. Tous droits réservés.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </DndProvider>
  );
}
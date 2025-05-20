import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { Bell, Truck, Shield, Heart, Settings, Activity, Clock, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import { config } from '../config';
import WorkflowTrigger from '../components/WorkflowTrigger';
import EmergencyWorkflowBuilder from '../components/EmergencyWorkflowBuilder';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Dashboard from '../components/Dashboard';
import Emergency from '../components/Emergency';

// Interfaces et données existantes
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

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch(`${config.n8nApiUrl}/health`, { method: 'GET' }).catch(() => ({ ok: false }));
        setSystemStatus(response.ok ? 'online' : 'degraded');
        if (!response.ok) showToast('Connectivité limitée', 'Le système fonctionne en mode dégradé.', 'warning');
      } catch {
        setSystemStatus('offline');
        showToast('Système hors ligne', 'Impossible de se connecter au serveur.', 'error');
      }
    };

    checkSystemStatus();
    const intervalId = setInterval(checkSystemStatus, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const refreshData = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
      showToast('Données actualisées', 'Les informations ont été mises à jour avec succès.', 'success');
    } catch {
      showToast('Erreur de synchronisation', 'Impossible d\'actualiser les données.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const showToast = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  };

    const [isSOSPulsing, setIsSOSPulsing] = useState(false);

  const handleSOSClick = () => {
    setIsSOSPulsing(true);
    setTimeout(() => {
      setIsSOSPulsing(false);
      router.push('/emergency');
    }, 800);
  };

  return (
  <DndProvider backend={HTML5Backend}>
      <div className={styles.homePage}>
        <Head>
          <title>SOS - SYSTEME D'ALERTE D'URGENCE</title>
          <meta name="description" content="Système d'alerte d'urgence pour la gestion des situations critiques" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className="navbar">
          <div className="container flex justify-between items-center">
            <div className="navbar-links">
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
          <section className={styles.hero}>
            <div className={styles.heroBackground}></div>
            <div className="container">
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>SYSTEME D'ALERTE D'URGENCE</h1>
                <h2 className={styles.heroSubtitle}>
                  Plateforme de gestion centralisée <br></br> des alertes et des interventions d'urgence
                </h2>

                <section className={styles.sosSection}>
                  <div className="container">
                    <div className={styles.sosContainer}>
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
              </div>
            </div>
          </section>



      {/* Quick Actions Section */}
       <Emergency />

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
                    return (
                      <div key={alert.id} className={`${styles.alertCard} ${typeInfo.class}`}>
                        <div className={styles.alertHeader}>
                          <typeInfo.icon className={styles.alertIcon} />
                          <div>
                            <div className={styles.alertType}>{typeInfo.name}</div>
                            <div className={styles.alertLocation}>{alert.location}</div>
                          </div>
                          <div className={`${styles.alertStatus} ${statusInfo.class}`}>
                            {statusInfo.name}
                          </div>
                        </div>
                        <div className={styles.alertDetails}>
                          <p><strong>Véhicule :</strong> {alert.vehicleId}</p>
                          <p><strong>Chauffeur :</strong> {alert.driverName}</p>
                          <p><strong>Heure :</strong> {formatDate(alert.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className={styles.workflowSection}>
            <div className="container">
              {/* <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Interface Workflows (n8n.io)</h2>
                <p className={styles.sectionSubtitle}>Créez et gérez vos workflows d'automatisation ici</p>
              </div> */}
{/* 
              <EmergencyWorkflowBuilder />
              <WorkflowTrigger />
              <Dashboard /> */}
            </div>
          </section>
        </main>
      </div>
    </DndProvider>
  );
}

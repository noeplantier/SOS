import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { 
  AlertTriangle, Bell, Zap, Radio, Users, Shield, MapPin, 
  Clock, ArrowLeft, CheckCircle, Loader, Phone, MessageSquare, 
  FileText, Info, X,
  Heart
} from 'lucide-react';

// Types pour une meilleure structure
type AlertStage = 'initializing' | 'detecting' | 'sending' | 'dispatching' | 'complete';
type AlertType = 'medical' | 'security' | 'fire' | 'other';
type Location = { lat: number; lng: number; address: string | null };

const AlertPage: React.FC = () => {
  // Hooks
  const router = useRouter();
  
  // États
  const [alertStage, setAlertStage] = useState<AlertStage>('initializing');
  const [location, setLocation] = useState<Location | null>(null);
  const [timePassed, setTimePassed] = useState(0);
  const [emergencyType, setEmergencyType] = useState<AlertType>('medical');
  const [showDetails, setShowDetails] = useState(false);
  const [alertId] = useState(() => `ALT-${Math.floor(Math.random() * 900000) + 100000}`);
  const [responders, setResponders] = useState<{ id: string; name: string; eta: number; type: string }[]>([]);
  
  // Effets
  useEffect(() => {
    // 1. Simulation du processus d'alerte avec transitions optimisées
    const stageTimings = {
      initializing: 1500,
      detecting: 2000,
      sending: 2500,
      dispatching: 3000
    };
    
    const stages: AlertStage[] = ['initializing', 'detecting', 'sending', 'dispatching', 'complete'];
    let currentStageIndex = 0;
    let timeoutId: NodeJS.Timeout;
    
    const proceedToNextStage = () => {
      if (currentStageIndex < stages.length - 1) {
        currentStageIndex++;
        const nextStage = stages[currentStageIndex];
        setAlertStage(nextStage);
        
        if (nextStage !== 'complete') {
          timeoutId = setTimeout(
            proceedToNextStage, 
            stageTimings[nextStage as keyof typeof stageTimings]
          );
        } else {
          // Lorsque nous atteignons l'étape finale, générer des intervenants simulés
          generateResponders();
        }
      }
    };

    // Démarrer la séquence d'alerte
    timeoutId = setTimeout(proceedToNextStage, stageTimings.initializing);
    
    // 2. Obtenir la géolocalisation réelle
    let geoWatchId: number;
    if (navigator.geolocation) {
      geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude: lng } = position.coords;
          
          // Fonction pour obtenir l'adresse à partir des coordonnées (reverse geocoding)
          const getAddressFromCoords = async (lat: number, lng: number) => {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
              );
              const data = await response.json();
              return data.display_name || null;
            } catch (error) {
              console.error("Erreur lors de la géolocalisation inverse:", error);
              return null;
            }
          };
          
          // Obtenir l'adresse (de manière optimisée avec debouncing)
          getAddressFromCoords(latitude, lng).then(address => {
            setLocation({
              lat: latitude,
              lng,
              address
            });
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          // Position par défaut avec adresse générique
          setLocation({ 
            lat: 48.8566, 
            lng: 2.3522, 
            address: "Position approximative" 
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
    
    // 3. Timer pour suivre le temps écoulé
    const intervalId = setInterval(() => {
      setTimePassed(prev => prev + 1);
    }, 1000);
    
    // Nettoyage
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      if (geoWatchId) navigator.geolocation.clearWatch(geoWatchId);
    };
  }, []);
  
  // Fonction pour générer des intervenants simulés
  const generateResponders = useCallback(() => {
    const responderTypes = {
      medical: ['Ambulance', 'Médecin urgentiste', 'Secouriste'],
      security: ['Police', 'Agent de sécurité', 'Intervention tactique'],
      fire: ['Pompiers', 'Unité de sauvetage', 'Véhicule d\'intervention'],
      other: ['Équipe d\'assistance', 'Agent de coordination', 'Service d\'urgence']
    };
    
    const selectedResponders = responderTypes[emergencyType];
    const count = Math.floor(Math.random() * 2) + 2; // 2-3 intervenants
    
    const newResponders = Array.from({ length: count }, (_, i) => ({
      id: `resp-${i}`,
      name: selectedResponders[i % selectedResponders.length],
      eta: Math.floor(Math.random() * 10) + 3, // 3-12 minutes
      type: emergencyType
    }));
    
    setResponders(newResponders);
  }, [emergencyType]);
  
  // Optimiser avec useMemo
  const progressSteps = useMemo(() => [
    { id: 'init', label: 'Initialisation', icon: Clock },
    { id: 'detect', label: 'Détection', icon: Zap },
    { id: 'send', label: 'Envoi', icon: Bell },
    { id: 'dispatch', label: 'Déploiement', icon: Shield },
    { id: 'complete', label: 'En route', icon: Users },
  ], []);
  
  const stageMessages = useMemo(() => ({
    initializing: "Initialisation du protocole d'urgence...",
    detecting: "Détection de votre position et analyse du niveau d'urgence...",
    sending: "Envoi du signal d'alerte aux services concernés...",
    dispatching: "Déploiement des équipes d'intervention...",
    complete: "Les secours sont en route. Restez à votre position actuelle."
  }), []);
  
  // Handler optimisé
  const handleTypeChange = useCallback((type: AlertType) => {
    setEmergencyType(type);
    
    // Régénérer les intervenants si nous sommes à l'étape finale
    if (alertStage === 'complete') {
      generateResponders();
    }
  }, [alertStage, generateResponders]);
  
  const formatTimePassed = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);
  
  const AlertTypeButton = useCallback(({ type, label, icon: Icon }: { type: AlertType, label: string, icon: any }) => (
    <button 
      className={`${styles.typeButton} ${emergencyType === type ? styles.active : ''}`}
      onClick={() => handleTypeChange(type)}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  ), [emergencyType, handleTypeChange]);

  return (
    <div className={styles.alertPage}>
      <Head>
        <title>⚠️ ALERTE {alertId} | Système d'Alerte d'Urgence</title>
        <meta name="description" content="Alerte d'urgence en cours de traitement" />
        <meta name="theme-color" content="#e63946" />
      </Head>

      <div className={styles.alertHeader}>
        <button 
          className={styles.backButton}
          onClick={() => router.push('/')}
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        
        <div className={styles.alertMeta}>
          <div className={styles.alertId}>
            <span>ID: {alertId}</span>
          </div>
          
          <div className={styles.alertTimer}>
            <Clock size={16} />
            <span>Temps écoulé: {formatTimePassed(timePassed)}</span>
          </div>
        </div>
      </div>

      <main className={styles.alertMain}>
        <div className={styles.alertContainer}>
          <div className={styles.alertIcon}>
            <AlertTriangle size={250} color="#d70012ec" />
          </div>
          
          <h1 className={styles.alertTitle}>ALERTE EN COURS</h1>
          
          <div className={styles.alertStatus}>
            <div className={`${styles.statusPulse} ${styles.active}`}></div>
            <span>Signal d'urgence actif</span>
          </div>
          
     

          <div className={styles.alertInfo}>
            <div className={styles.infoItem}>
              <MapPin size={20} />
              <span>
                {location ? (
                  <span className={styles.locationText}>
                    {location.address || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                  </span>
                ) : 'Localisation en cours...'}
              </span>
            </div>
            
            {alertStage === 'complete' && (
              <>
                <div className={styles.infoItem}>
                  <Users size={20} />
                  <span>Intervenants: {responders.length}</span>
                </div>
                <div className={styles.infoItem}>
                  <Clock size={20} />
                  <span>
                    ETA: {Math.min(...responders.map(r => r.eta))} min
                  </span>
                </div>
              </>
            )}
            
            <div className={styles.infoItem}>
              <Radio size={20} />
              <span>Canal d'urgence: <strong>Actif</strong></span>
            </div>
          </div>

          <div className={styles.alertProgress}>
            {progressSteps.map((step, index) => {
              // Logique pour déterminer l'état de chaque étape
              const stageIndex = ['initializing', 'detecting', 'sending', 'dispatching', 'complete']
                .indexOf(alertStage);
              const currentStepIndex = index;
              
              let stepStatus = '';
              if (currentStepIndex < stageIndex) stepStatus = 'completed';
              else if (currentStepIndex === stageIndex) stepStatus = 'current';
              
              return (
                <React.Fragment key={step.id}>
                  <div className={styles.progressStep}>
                    <div className={`${styles.stepIcon} ${stepStatus ? styles[stepStatus] : ''}`}>
                      {stepStatus === 'completed' ? (
                        <CheckCircle size={20} />
                      ) : stepStatus === 'current' ? (
                        <Loader size={20} className={styles.spinner} />
                      ) : (
                        React.createElement(step.icon, { size: 20 })
                      )}
                    </div>
                    <div className={styles.stepLabel}>{step.label}</div>
                  </div>
                  
                  {index < progressSteps.length - 1 && (
                    <div className={`${styles.progressLine} ${
                      currentStepIndex < stageIndex ? styles.completed : ''
                    }`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className={styles.alertMessage}>
            {stageMessages[alertStage]}
          </div>
          
          {alertStage === 'complete' && (
            <>
              <div className={styles.respondersSection}>
                <div className={styles.sectionHeader}>
                  <h3>Intervenants en route</h3>
                  <div className={styles.sectionActions}>
                    <button 
                      className={styles.detailToggle}
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? 'Masquer détails' : 'Afficher détails'}
                    </button>
                  </div>
                </div>
                
                <div className={styles.respondersList}>
                  {responders.map((responder) => (
                    <div key={responder.id} className={styles.responderCard}>
                      <div className={styles.responderIcon}>
                        {responder.type === 'medical' ? <Heart size={20} /> :
                         responder.type === 'security' ? <Shield size={20} /> :
                         responder.type === 'fire' ? <AlertTriangle size={20} /> :
                         <Info size={20} />}
                      </div>
                      <div className={styles.responderInfo}>
                        <div className={styles.responderName}>{responder.name}</div>
                        <div className={styles.responderEta}>
                          Arrivée estimée: {responder.eta} min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {showDetails && (
                  <div className={styles.alertDetails}>
                    <div className={styles.detailsCard}>
                      <h4>Informations supplémentaires</h4>
                      <div className={styles.detailItem}>
                        <strong>ID de l'alerte:</strong> {alertId}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Heure de déclenchement:</strong> {
                          new Date(Date.now() - timePassed * 1000).toLocaleTimeString()
                        }
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Position:</strong> {
                          location ? 
                            `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 
                            'Non disponible'
                        }
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Adresse:</strong> {
                          location?.address || 'Non disponible'
                        }
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Type d'urgence:</strong> {
                          {
                            'medical': 'Médicale',
                            'security': 'Sécurité',
                            'fire': 'Incendie',
                            'other': 'Autre'
                          }[emergencyType]
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.alertActions}>
                <button className={`${styles.actionButton} ${styles.primary}`}>
                  <Phone size={16} />
                  <span>Appeler les secours</span>
                </button>
                <button className={`${styles.actionButton} ${styles.secondary}`}>
                  <MessageSquare size={16} />
                  <span>Envoyer un message</span>
                </button>
                <button className={`${styles.actionButton} ${styles.tertiary}`}>
                  <FileText size={16} />
                  <span>Rapport</span>
                </button>
              </div>
            </>
          )}
          
          {alertStage !== 'complete' && (
            <div className={styles.alertHint}>
              <Info size={16} />
              <span>Restez en attente pendant le traitement de votre alerte...</span>
            </div>
          )}
        </div>
      </main>
      
      <footer className={styles.alertFooter}>
        <div className={styles.footerContent}>
          <div className={styles.footerText}>
            Système d'Alerte d'Urgence - Tous droits réservés
          </div>
        
        </div>
      </footer>
    </div>
  );
};

export default AlertPage;
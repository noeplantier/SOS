import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import {
  Phone, MessageSquare, Mail, CheckCircle, ArrowLeft, AlertTriangle
} from 'lucide-react';

const AlertDetails: React.FC = () => {
  const router = useRouter();
  const [selectedMethods, setSelectedMethods] = useState({
    call: false,
    sms: false,
    email: false,
  });

  const handleMethodSelection = (method: string) => {
    setSelectedMethods(prev => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  const triggerAlert = () => {
    if (selectedMethods.call) {
      window.location.href = 'tel:+1234567890'; // Remplacez par le numéro réel
    }
    if (selectedMethods.sms) {
      window.location.href = 'sms:+1234567890?body=Message%20d%27urgence'; // Remplacez par le numéro réel
    }
    if (selectedMethods.email) {
      window.location.href = 'mailto:contact@example.com?subject=Urgence&body=Message%20d%27urgence'; // Remplacez par l'email réel
    }
    router.push('/');
  };

  return (
    <div className={styles.alertPage}>
      <Head>
        <title>⚠️ CONFIRMATION D'ALERTE | Système d'Alerte d'Urgence</title>
        <meta name="description" content="Confirmation de l'envoi de l'alerte d'urgence" />
        <meta name="theme-color" content="#e63946" />
      </Head>

      <div className={styles.alertHeader}>
        <button
          className={styles.backButton}
          onClick={() => router.push('/alert')}
          aria-label="Retour à l'alerte"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
      </div>

      <main className={styles.alertMain}>
        <div className={styles.alertContainer}>
          <div className={styles.alertIcon}>
            <AlertTriangle size={250} color="#d70012ec" />
          </div>

          <h1 className={styles.alertTitle}>CONFIRMER L'ALERTE</h1>

          <div className={styles.alertInfo}>
            <div className={styles.infoItem}>
              <span>Sélectionnez les méthodes d'alerte à utiliser.</span>
            </div>
          </div>

          <div className={styles.tiltedCardsContainer}>
            <div className={`${styles.tiltedCard} ${selectedMethods.call ? styles.selected : ''}`} 
                 onClick={() => handleMethodSelection('call')}
                 style={{
                   '--card-rotation': '-2deg',
                   '--card-scale': '1',
                   '--card-z-index': '1',
                 } as React.CSSProperties}>
              <div className={styles.tiltedCardInner}>
                <div className={styles.tiltedCardIconWrapper} style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
                  <Phone size={24} color="#0ea5e9" />
                </div>
                <h3 className={styles.tiltedCardTitle}>Appel</h3>
                {selectedMethods.call && 
                  <div className={styles.selectedIndicator}>
                    <CheckCircle size={24} />
                  </div>
                }
                <div className={styles.tiltedCardShine}></div>
              </div>
            </div>
            
            <div className={`${styles.tiltedCard} ${selectedMethods.sms ? styles.selected : ''}`}
                 onClick={() => handleMethodSelection('sms')}
                 style={{
                   '--card-rotation': '0deg',
                   '--card-scale': '1.05',
                   '--card-z-index': '2',
                 } as React.CSSProperties}>
              <div className={styles.tiltedCardInner}>
                <div className={styles.tiltedCardIconWrapper} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  <MessageSquare size={24} color="#f59e0b" />
                </div>
                <h3 className={styles.tiltedCardTitle}>SMS</h3>
                {selectedMethods.sms && 
                  <div className={styles.selectedIndicator}>
                    <CheckCircle size={24} />
                  </div>
                }
                <div className={styles.tiltedCardShine}></div>
              </div>
            </div>
            
            <div className={`${styles.tiltedCard} ${selectedMethods.email ? styles.selected : ''}`}
                 onClick={() => handleMethodSelection('email')}
                 style={{
                   '--card-rotation': '2deg',
                   '--card-scale': '1',
                   '--card-z-index': '1',
                 } as React.CSSProperties}>
              <div className={styles.tiltedCardInner}>
                <div className={styles.tiltedCardIconWrapper} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <Mail size={24} color="#ef4444" />
                </div>
                <h3 className={styles.tiltedCardTitle}>Email</h3>
                {selectedMethods.email && 
                  <div className={styles.selectedIndicator}>
                    <CheckCircle size={24} />
                  </div>
                }
                <div className={styles.tiltedCardShine}></div>
              </div>
            </div>
          </div>

          <button className={styles.sosButton} onClick={triggerAlert}>
            Envoyer
          </button>
        </div>
      </main>
    </div>
  );
};

export default AlertDetails;
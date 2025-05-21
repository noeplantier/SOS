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

          <div className={styles.actionsGrid}>
            <div className={styles.actionCard} onClick={() => handleMethodSelection('call')}>
              <div className={styles.actionIcon} style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                <Phone size={24} />
              </div>
              <div className={styles.actionTitle}>Appel Téléphonique</div>
              {selectedMethods.call && <CheckCircle size={24} color="green" />}
            </div>
            <div className={styles.actionCard} onClick={() => handleMethodSelection('sms')}>
              <div className={styles.actionIcon} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <MessageSquare size={24} />
              </div>
              <div className={styles.actionTitle}>SMS</div>
              {selectedMethods.sms && <CheckCircle size={24} color="green" />}
            </div>
            <div className={styles.actionCard} onClick={() => handleMethodSelection('email')}>
              <div className={styles.actionIcon} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <Mail size={24} />
              </div>
              <div className={styles.actionTitle}>Email</div>
              {selectedMethods.email && <CheckCircle size={24} color="green" />}
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

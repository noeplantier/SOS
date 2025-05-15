/**
 * Configuration centralisée et optimisée pour l'application SOS
 * @version 1.0.0
 */

// Types pour la configuration
export interface Config {
  // Configuration de l'API n8n
  n8nApiUrl: string;
  n8nApiKey: string;
  
  // URL du webhook pour les alertes SOS
  sosWebhookUrl: string;
  
  // Intervalles de rafraîchissement des données (en ms)
  refreshIntervals: {
    workflows: number;
    executions: number;
    alerts: number;
  };
  
  // Configuration des alertes
  alerts: {
    types: Array<{
      id: string;
      name: string;
      color: string;
      icon: string;
    }>;
    priorities: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };
  
  // Routes de l'API système SOS
  sosApi: {
    baseUrl: string;
    endpoints: {
      vehicles: string;
      drivers: string;
      contacts: string;
      alerts: string;
    };
  };
}

/**
 * Configuration du mode de fonctionnement actuel
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Fonction pour obtenir les variables d'environnement avec valeurs par défaut
 */
function getEnv(key: string, defaultValue: string): string {
  // Pour le client (navigateur)
  if (typeof window !== 'undefined') {
    return (window as any).__ENV__?.[key] || 
           process.env[`NEXT_PUBLIC_${key}`] || 
           defaultValue;
  }
  // Pour le serveur
  return process.env[`NEXT_PUBLIC_${key}`] || 
         process.env[key] || 
         defaultValue;
}

/**
 * Configuration principale de l'application
 * Optimisée avec des valeurs par défaut et récupération des variables d'environnement
 */
export const config: Config = {
  // Configuration de l'API n8n
  n8nApiUrl: getEnv('N8N_API_URL', isDevelopment 
    ? 'https://noeplantier.app.n8n.cloud/webhook/6f7b288e-1efe-4504-a6fd-660931327269' 
    : 'https://n8n.sos-service.com/api/v1'),
    
  n8nApiKey: getEnv('N8N_API_KEY', ''),
  
  // URL du webhook pour les alertes SOS
  sosWebhookUrl: getEnv('SOS_WEBHOOK_URL', isDevelopment 
    ? 'https://noeplantier.app.n8n.cloud/webhook/6f7b288e-1efe-4504-a6fd-660931327269' 
    : 'https://n8n.sos-service.com/webhook/sos'),
  
  // Intervalles de rafraîchissement
  refreshIntervals: {
    workflows: parseInt(getEnv('REFRESH_WORKFLOWS', '30000')),
    executions: parseInt(getEnv('REFRESH_EXECUTIONS', '5000')),
    alerts: parseInt(getEnv('REFRESH_ALERTS', '10000')),
  },
  
  // Configuration des alertes
  alerts: {
    types: [
      {
        id: "medical",
        name: "Urgence médicale",
        color: "red",
        icon: "heart-pulse",
      },
      {
        id: "security",
        name: "Urgence sécurité",
        color: "amber",
        icon: "shield-alert",
      },
      {
        id: "technical",
        name: "Urgence technique",
        color: "blue",
        icon: "wrench",
      },
    ],
    priorities: [
      {
        id: "high",
        name: "Haute",
        color: "red",
      },
      {
        id: "medium",
        name: "Moyenne",
        color: "amber",
      },
      {
        id: "low",
        name: "Basse",
        color: "green",
      },
    ],
  },
  
  // API système SOS
  sosApi: {
    baseUrl: getEnv('SOS_API_URL', isDevelopment 
      ? 'http://localhost:3001/api' 
      : 'https://api.sos-service.com'),
    endpoints: {
      vehicles: "/vehicles",
      drivers: "/drivers",
      contacts: "/contacts",
      alerts: "/alerts",
    },
  },
};

/**
 * Fonctions utilitaires liées à la configuration
 */
export const configUtils = {
  /**
   * Obtient l'URL complète pour un endpoint de l'API
   */
  getApiUrl: (endpoint: string): string => {
    return `${config.sosApi.baseUrl}${endpoint}`;
  },

  /**
   * Réinitialise la configuration (pour les tests)
   */
  reset: (): void => {
    // Cette fonction est utilisée principalement pour les tests
    Object.keys(config).forEach(key => {
      if (typeof (config as any)[key] === 'object') {
        Object.assign((config as any)[key], (defaultConfig as any)[key]);
      } else {
        (config as any)[key] = (defaultConfig as any)[key];
      }
    });
  },
  
  /**
   * Vérifie si la configuration est valide
   */
  isValid: (): boolean => {
    return !!config.n8nApiUrl && 
           config.refreshIntervals.workflows > 0 && 
           config.refreshIntervals.executions > 0;
  }
};

// Sauvegarde la configuration par défaut pour pouvoir la réinitialiser
const defaultConfig = { ...config };

// Export par défaut
export default config;
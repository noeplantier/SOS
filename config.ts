export const config = {
  // URL de base de l'API n8n
  n8nApiUrl: process.env.NEXT_PUBLIC_N8N_API_URL || "http://localhost:5678",
  
  // Clé API n8n
  n8nApiKey: process.env.NEXT_PUBLIC_N8N_API_KEY || "",
  
  // URL du webhook SOS
  sosWebhookUrl: process.env.NEXT_PUBLIC_SOS_WEBHOOK_URL || "https://noeplantier.app.n8n.cloud/webhook/6f7b288e-1efe-4504-a6fd-660931327269",
  
  // Délais de rafraîchissement (en ms)
  refreshIntervals: {
    workflows: 30000, // 30 secondes
    executions: 5000, // 5 secondes
  },

  // Configuration des alertes
  alertTypes: [
    { id: "medical", name: "Médicale", color: "red" },
    { id: "security", name: "Sécurité", color: "amber" },
    { id: "technical", name: "Technique", color: "blue" }
  ],

  // Priorités des alertes
  alertPriorities: [
    { id: "high", name: "Haute", color: "red" },
    { id: "medium", name: "Moyenne", color: "amber" },
    { id: "low", name: "Basse", color: "green" }
  ],

  // Configuration de l'interface
  ui: {
    appName: "SOS Transport",
    appLogo: "/logo.svg",
    theme: {
      primaryColor: "#ff2222",
      secondaryColor: "#0066cc",
      accentColor: "#ffaa00"
    }
  }
};

// Types pour la configuration
export interface AlertType {
  id: string;
  name: string;
  color: string;
}

export interface AlertPriority {
  id: string;
  name: string;
  color: string;
}
/**
 * Point d'entrée principal pour l'intégration n8n SOS
 * Ce fichier charge tous les nœuds personnalisés et les enregistre dans n8n
 */

'use strict';

// Importations optimisées
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  // Version sémantique de l'intégration
  version: process.env.SOS_VERSION || '1.0.0',
  
  // Débuggage activé/désactivé
  debug: process.env.SOS_DEBUG === 'true',
  
  // Dossier contenant les nœuds
  nodesDir: path.resolve(__dirname, 'nodes'),
  
  // Dossier contenant les credentials
  credentialsDir: path.resolve(__dirname, 'credentials'),
};

/**
 * Logger optimisé
 */
const logger = {
  log: (message) => config.debug && console.log(`[SOS] ${message}`),
  error: (message, error) => console.error(`[SOS Error] ${message}`, error || ''),
  info: (message) => console.info(`[SOS Info] ${message}`),
};

/**
 * Charge un nœud depuis son fichier
 * @param {string} filepath - Chemin du fichier
 * @returns {Object|null} - Nœud chargé ou null en cas d'erreur
 */
function loadNodeFromFile(filepath) {
  try {
    // Charger dynamiquement le fichier
    const nodeFile = require(filepath);
    
    // Vérifier la structure du fichier
    if (!nodeFile) {
      logger.error(`Le fichier ${filepath} n'exporte rien`);
      return null;
    }
    
    // Ajouter le chemin source pour les ressources (comme les icônes)
    return {
      ...nodeFile,
      sourcePath: filepath,
    };
  } catch (error) {
    logger.error(`Erreur lors du chargement de ${filepath}`, error);
    return null;
  }
}

/**
 * Charge récursivement tous les nœuds d'un dossier
 * @param {string} dir - Dossier à scanner
 * @returns {Array} - Liste des nœuds chargés
 */
function loadNodesFromDirectory(dir) {
  try {
    if (!fs.existsSync(dir)) {
      logger.error(`Le dossier ${dir} n'existe pas`);
      return [];
    }

    const result = [];
    const files = fs.readdirSync(dir);

    // Utiliser une boucle for standard pour de meilleures performances
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Récursion sur les sous-dossiers
        result.push(...loadNodesFromDirectory(filePath));
      } else if (file.endsWith('.node.js')) {
        // Charger seulement les fichiers .node.js
        const node = loadNodeFromFile(filePath);
        if (node) {
          result.push(node);
        }
      }
    }

    return result;
  } catch (error) {
    logger.error(`Erreur lors du chargement des nœuds depuis ${dir}`, error);
    return [];
  }
}

/**
 * Charge les credentials depuis un dossier
 * @param {string} dir - Dossier à scanner
 * @returns {Array} - Liste des credentials chargés
 */
function loadCredentialsFromDirectory(dir) {
  try {
    if (!fs.existsSync(dir)) {
      logger.log(`Le dossier credentials ${dir} n'existe pas`);
      return [];
    }

    const result = [];
    const files = fs.readdirSync(dir);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.endsWith('.credentials.js')) {
        const filePath = path.join(dir, file);
        try {
          const creds = require(filePath);
          if (creds) {
            result.push(creds);
          }
        } catch (error) {
          logger.error(`Erreur lors du chargement des credentials ${file}`, error);
        }
      }
    }

    return result;
  } catch (error) {
    logger.error(`Erreur lors du chargement des credentials depuis ${dir}`, error);
    return [];
  }
}

// Charger tous les nœuds et credentials
const nodes = loadNodesFromDirectory(config.nodesDir);
const credentials = loadCredentialsFromDirectory(config.credentialsDir);

// Afficher les informations de chargement
if (config.debug) {
  logger.info(`Intégration SOS v${config.version}`);
  logger.log(`${nodes.length} nœud(s) chargé(s)`);
  logger.log(`${credentials.length} credential(s) chargé(s)`);
}

// Afficher un avertissement s'il n'y a aucun nœud
if (nodes.length === 0) {
  logger.error("Aucun nœud n'a été chargé. Vérifiez le dossier 'nodes'.");
}

// Exporter pour n8n
module.exports = {
  // Exporter tous les nœuds chargés
  nodes,
  
  // Exporter tous les credentials chargés
  credentials,
  
  // Métadonnées pour n8n
  nodeTypes: {
    // Définit le namespace pour tous les nœuds
    namespace: 'sos',
  },
};

// Exécuter une fonction d'initialisation si nécessaire
(function initialize() {
  try {
    // Code d'initialisation à exécuter au démarrage si nécessaire
    // Par exemple, vérification des variables d'environnement requises
    
    const requiredEnvVars = ['NEXT_PUBLIC_N8N_API_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      logger.log(`⚠️ Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    }
  } catch (error) {
    logger.error("Erreur lors de l'initialisation", error);
  }
})();
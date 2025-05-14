# SOS - Intégration de n8n

Ce dépôt contient un nœud personnalisé pour [n8n](https://n8n.io/), une plateforme d'automatisation de flux de travail qui s'intègre à votre SaaS SOS.

## À propos

SOS utilise n8n pour automatiser les flux de travail et intégrer différents services. Le nœud personnalisé développé ici permet d'étendre les fonctionnalités standard de n8n pour répondre aux besoins spécifiques de la plateforme SOS.

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Une installation de n8n (locale ou hébergée)

## Installation

### 1. Installation de n8n

Pour installer n8n globalement :

```bash
npm install n8n -g
```

Pour démarrer n8n :

```bash
n8n start
```

### 2. Installation du nœud personnalisé

Clonez ce dépôt dans le répertoire des nœuds personnalisés de n8n :

```bash
cd ~/.n8n/custom
git clone https://url-de-votre-repo/SOS.git
cd SOS
npm install
```

### 3. Configuration

Assurez-vous que les dépendances sont correctement installées :

```bash
npm install
```

## Utilisation du nœud personnalisé

Le nœud "Mon Nœud Personnalisé" offre deux opérations principales :

1. **Opération 1** : Traite un texte en entrée en le transformant en majuscules
2. **Opération 2** : Effectue un calcul en multipliant par 2 la valeur numérique fournie

### Exemple d'utilisation dans un workflow

1. Dans l'interface de n8n, créez un nouveau workflow
2. Recherchez "Mon Nœud Personnalisé" dans la barre de recherche des nœuds
3. Ajoutez-le à votre workflow
4. Configurez l'opération souhaitée et les paramètres associés

## Développement

### Structure du nœud

Le nœud est implémenté dans le fichier [execute.ts](execute.ts) et suit l'architecture standard des nœuds n8n.

### Ajouter de nouvelles fonctionnalités

Pour étendre les fonctionnalités du nœud :

1. Ajoutez de nouvelles options dans le tableau `options` de la propriété `operation`
2. Ajoutez les nouveaux paramètres dans le tableau `properties`
3. Implémentez la logique correspondante dans la méthode `execute()`

## Déploiement sur votre SaaS

Pour déployer cette intégration sur votre environnement SaaS SOS :

1. Construisez le nœud personnalisé :
```bash
npm run build
```

2. Copiez les fichiers générés dans le dossier des nœuds personnalisés de votre instance n8n de production
3. Redémarrez votre instance n8n

## Résolution des problèmes

Si vous rencontrez des difficultés avec l'intégration de n8n dans SOS :

1. Vérifiez les logs de n8n
2. Assurez-vous que les dépendances sont à jour
3. Vérifiez que le nœud personnalisé est correctement chargé au démarrage de n8n

## Ressources

- [Documentation n8n](https://docs.n8n.io/)
- [Création de nœuds personnalisés](https://docs.n8n.io/integrations/creating-nodes/)
- [Communauté n8n](https://community.n8n.io/)


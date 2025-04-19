# Package d'installation pour PrintTrack

Ce document contient les instructions pour installer et configurer l'application PrintTrack sur un serveur d'hébergement.

## Contenu du package

- `frontend/` - Code source du frontend React/TypeScript
- `backend/` - Code source du backend Node.js/Express
- `database/` - Scripts de configuration de la base de données MongoDB
- `docker/` - Fichiers Docker pour le déploiement conteneurisé
- `scripts/` - Scripts d'installation et de configuration

## Prérequis

- Node.js 16.x ou supérieur
- MongoDB 5.0 ou supérieur
- Docker et Docker Compose (optionnel, pour le déploiement conteneurisé)
- Serveur Linux avec au moins 2 Go de RAM et 10 Go d'espace disque

## Options d'installation

### Option 1: Installation manuelle

1. **Configuration du backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Modifier le fichier .env avec vos paramètres
   npm run build
   ```

2. **Configuration du frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Modifier le fichier .env avec l'URL de votre API
   npm run build
   ```

3. **Configuration de la base de données**
   ```bash
   mongorestore --db printtrack database/dump
   ```

4. **Démarrage de l'application**
   ```bash
   cd backend
   npm start
   ```

5. **Configuration du serveur web (Nginx)**
   ```
   server {
       listen 80;
       server_name votre-domaine.com;

       location / {
           root /chemin/vers/frontend/build;
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Déploiement avec Docker

1. **Configuration des variables d'environnement**
   ```bash
   cp .env.example .env
   # Modifier le fichier .env avec vos paramètres
   ```

2. **Démarrage des conteneurs**
   ```bash
   docker-compose up -d
   ```

## Services d'hébergement recommandés

### 1. DigitalOcean

DigitalOcean offre des Droplets (serveurs virtuels) qui sont parfaits pour héberger l'application PrintTrack.

**Étapes de déploiement:**
1. Créer un Droplet avec Ubuntu 20.04
2. Suivre les instructions d'installation manuelle ou Docker ci-dessus
3. Configurer un nom de domaine et SSL avec Let's Encrypt

**Avantages:**
- Interface simple
- Tarification prévisible
- Bonnes performances
- Possibilité de sauvegardes automatiques

### 2. Heroku

Heroku est une plateforme cloud qui permet de déployer, gérer et faire évoluer des applications.

**Étapes de déploiement:**
1. Créer un compte Heroku
2. Installer Heroku CLI
3. Initialiser un dépôt Git pour l'application
4. Déployer avec `git push heroku main`

**Avantages:**
- Déploiement simplifié
- Intégration continue
- Mise à l'échelle automatique
- Add-ons pour MongoDB (MongoDB Atlas)

### 3. AWS Elastic Beanstalk

AWS Elastic Beanstalk est un service pour déployer et faire évoluer des applications web.

**Étapes de déploiement:**
1. Créer un environnement Elastic Beanstalk
2. Configurer les variables d'environnement
3. Déployer l'application via la console AWS ou l'interface de ligne de commande

**Avantages:**
- Haute disponibilité
- Mise à l'échelle automatique
- Intégration avec d'autres services AWS
- Surveillance et journalisation avancées

## Maintenance et mises à jour

### Sauvegardes

Il est recommandé de configurer des sauvegardes régulières de la base de données:

```bash
# Script de sauvegarde (à exécuter via cron)
mongodump --db printtrack --out /chemin/vers/backups/$(date +%Y-%m-%d)
```

### Mises à jour

Pour mettre à jour l'application:

1. Arrêter l'application
2. Sauvegarder la base de données
3. Remplacer les fichiers par la nouvelle version
4. Exécuter les migrations de base de données si nécessaire
5. Redémarrer l'application

## Support et dépannage

En cas de problème, vérifiez les journaux:

```bash
# Journaux du backend
tail -f /chemin/vers/backend/logs/app.log

# Journaux Docker
docker-compose logs -f
```

Pour toute assistance supplémentaire, contactez support@printtrack.com

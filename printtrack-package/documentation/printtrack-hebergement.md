# Configuration de l'hébergement pour PrintTrack

Ce document détaille la configuration d'un service d'hébergement complet pour l'application PrintTrack, permettant d'accéder à toutes les fonctionnalités interactives.

## Options d'hébergement recommandées

### 1. DigitalOcean (Recommandé)

DigitalOcean offre une solution simple et économique pour héberger l'application PrintTrack complète.

#### Configuration recommandée:
- **Droplet**: Standard, 2 vCPUs, 4 GB RAM
- **Région**: Choisir la plus proche de vos utilisateurs
- **OS**: Ubuntu 20.04 LTS
- **Volume supplémentaire**: 50 GB pour les données MongoDB
- **Pare-feu**: Autoriser HTTP (80), HTTPS (443) et SSH (22)

#### Étapes de configuration:
1. Créer un compte sur [DigitalOcean](https://www.digitalocean.com/)
2. Créer un nouveau Droplet avec les spécifications ci-dessus
3. Se connecter au serveur via SSH
4. Transférer le package d'installation PrintTrack
5. Exécuter le script d'installation
6. Configurer un nom de domaine (optionnel)
7. Configurer HTTPS avec Let's Encrypt (recommandé)

#### Coût estimé: ~$24/mois

### 2. AWS Elastic Beanstalk

AWS offre une solution plus évolutive et robuste, idéale pour les déploiements d'entreprise.

#### Configuration recommandée:
- **Type d'environnement**: Web Server Environment
- **Plateforme**: Node.js
- **Type d'instance**: t3.small (2 vCPUs, 2 GB RAM)
- **Base de données**: MongoDB Atlas ou Amazon DocumentDB
- **Stockage**: Amazon S3 pour les fichiers statiques

#### Étapes de configuration:
1. Créer un compte AWS
2. Configurer un environnement Elastic Beanstalk
3. Configurer une base de données MongoDB Atlas ou DocumentDB
4. Déployer l'application via la console AWS ou l'interface de ligne de commande
5. Configurer un équilibreur de charge et l'auto-scaling
6. Configurer Route 53 pour le nom de domaine

#### Coût estimé: ~$50-100/mois selon l'utilisation

### 3. Heroku

Heroku offre une solution simple pour les déploiements rapides, mais avec un coût plus élevé.

#### Configuration recommandée:
- **Dyno**: Standard-1X (512MB RAM)
- **Add-ons**: MongoDB Atlas (M0 gratuit ou M2 pour la production)
- **Stockage**: Heroku Postgres pour les métadonnées

#### Étapes de configuration:
1. Créer un compte Heroku
2. Installer Heroku CLI
3. Créer une nouvelle application
4. Configurer les variables d'environnement
5. Déployer l'application avec Git
6. Configurer le domaine personnalisé

#### Coût estimé: ~$25-50/mois

## Configuration détaillée pour DigitalOcean (Recommandé)

### 1. Création du Droplet

1. Connectez-vous à votre compte DigitalOcean
2. Cliquez sur "Create" puis "Droplets"
3. Sélectionnez Ubuntu 20.04 LTS
4. Choisissez le plan "Standard" avec 2 vCPUs et 4 GB RAM
5. Sélectionnez une région proche de vos utilisateurs
6. Ajoutez votre clé SSH ou créez un mot de passe
7. Cliquez sur "Create Droplet"

### 2. Configuration initiale du serveur

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer les outils essentiels
apt install -y git curl wget unzip

# Configurer le pare-feu
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### 3. Installation de l'application

```bash
# Créer un répertoire pour l'application
mkdir -p /opt/printtrack-install

# Transférer le package d'installation (depuis votre machine locale)
# scp -r printtrack-package/* root@VOTRE_IP_DROPLET:/opt/printtrack-install/

# Accéder au répertoire d'installation
cd /opt/printtrack-install/scripts

# Rendre les scripts exécutables
chmod +x *.sh

# Exécuter le script d'installation
./install.sh
```

### 4. Configuration du nom de domaine (Optionnel)

1. Accédez à votre registraire de domaine
2. Ajoutez un enregistrement A pointant vers l'adresse IP de votre Droplet
3. Configurez Nginx pour utiliser votre domaine:

```bash
# Modifier la configuration Nginx
nano /etc/nginx/sites-available/printtrack

# Remplacer "server_name _;" par "server_name votre-domaine.com www.votre-domaine.com;"

# Redémarrer Nginx
systemctl reload nginx
```

### 5. Configuration HTTPS avec Let's Encrypt (Recommandé)

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir un certificat SSL
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Suivre les instructions à l'écran
# Choisir de rediriger tout le trafic HTTP vers HTTPS
```

### 6. Configuration des sauvegardes automatiques

```bash
# Configurer une tâche cron pour les sauvegardes quotidiennes
crontab -e

# Ajouter la ligne suivante pour une sauvegarde quotidienne à 2h du matin
0 2 * * * /opt/printtrack/scripts/backup.sh > /var/log/printtrack-backup.log 2>&1
```

### 7. Surveillance et maintenance

```bash
# Installer les outils de surveillance
apt install -y htop iotop

# Vérifier les journaux de l'application
journalctl -u printtrack-backend

# Vérifier les journaux Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Mise à l'échelle et haute disponibilité

Pour les déploiements nécessitant une haute disponibilité:

1. **Réplication MongoDB**: Configurer un cluster MongoDB avec réplication
2. **Load Balancer**: Utiliser DigitalOcean Load Balancer avec plusieurs Droplets
3. **Stockage partagé**: Utiliser DigitalOcean Spaces pour les fichiers partagés
4. **CDN**: Configurer Cloudflare ou DigitalOcean CDN pour les actifs statiques

## Sécurité

Mesures de sécurité supplémentaires recommandées:

1. **Fail2ban**: Protection contre les tentatives de connexion par force brute
2. **ModSecurity**: Pare-feu d'application Web pour Nginx
3. **Sauvegarde hors site**: Configurer des sauvegardes vers un emplacement externe
4. **Surveillance**: Configurer des alertes pour les événements système critiques

## Support et maintenance

Pour une assistance continue:

1. **Mises à jour régulières**: Utiliser le script update.sh pour maintenir l'application à jour
2. **Surveillance proactive**: Configurer des outils comme Netdata ou Prometheus
3. **Sauvegardes vérifiées**: Tester régulièrement la restauration des sauvegardes

# Guide de déploiement de l'application PrintTrack

Ce document fournit les instructions détaillées pour déployer l'application PrintTrack sur différentes plateformes d'hébergement.

## Contenu du package

Le package d'installation PrintTrack contient les éléments suivants :

- `frontend/` - Code source du frontend React/TypeScript
- `backend/` - Code source du backend Node.js/Express
- `database/` - Scripts de configuration de la base de données MongoDB
- `docker/` - Fichiers Docker pour le déploiement conteneurisé
- `scripts/` - Scripts d'installation et de déploiement automatisés

## Options de déploiement

Nous avons préparé trois options de déploiement pour vous permettre de choisir celle qui correspond le mieux à vos besoins :

### 1. DigitalOcean (Recommandé)

**Avantages :**
- Solution simple et économique
- Contrôle total sur l'infrastructure
- Performances prévisibles
- Coût mensuel fixe (~$24/mois)

**Prérequis :**
- Un compte DigitalOcean
- doctl (DigitalOcean CLI) installé localement (optionnel)

**Déploiement automatisé :**
```bash
cd scripts
chmod +x deploy_digitalocean.sh
./deploy_digitalocean.sh
```

Le script vous guidera à travers les étapes de configuration et déploiera automatiquement l'application sur un nouveau Droplet DigitalOcean.

**Déploiement manuel :**
Suivez les instructions détaillées dans le document `printtrack-hebergement.md`.

### 2. Heroku

**Avantages :**
- Déploiement très simple
- Mise à l'échelle automatique
- Intégration facile avec d'autres services
- Option gratuite disponible pour les tests

**Prérequis :**
- Un compte Heroku
- Heroku CLI installé localement
- Un compte Netlify (pour le frontend)

**Déploiement automatisé :**
```bash
cd scripts
chmod +x deploy_heroku.sh
./deploy_heroku.sh
```

Le script déploiera le backend sur Heroku et vous guidera pour déployer le frontend sur Netlify.

### 3. AWS Elastic Beanstalk

**Avantages :**
- Haute disponibilité
- Intégration avec l'écosystème AWS
- Options avancées de mise à l'échelle
- Surveillance et journalisation complètes

**Prérequis :**
- Un compte AWS
- AWS CLI et EB CLI installés localement
- Droits IAM appropriés

**Déploiement automatisé :**
```bash
cd scripts
chmod +x deploy_aws.sh
./deploy_aws.sh
```

Le script déploiera le backend sur Elastic Beanstalk et le frontend sur Amazon S3.

## Accès à l'application

Une fois le déploiement terminé, vous recevrez l'URL d'accès à l'application. Utilisez les identifiants par défaut pour vous connecter :

- **Email :** admin@printtrack.com
- **Mot de passe :** admin123

**Important :** Pour des raisons de sécurité, veuillez changer le mot de passe administrateur après la première connexion.

## Maintenance et mises à jour

### Sauvegardes

Pour effectuer une sauvegarde de l'application :

```bash
cd scripts
chmod +x backup.sh
sudo ./backup.sh
```

Les sauvegardes sont stockées dans `/opt/printtrack_backups/` et conservées pendant 7 jours par défaut.

### Mises à jour

Pour mettre à jour l'application vers une nouvelle version :

```bash
cd scripts
chmod +x update.sh
sudo ./update.sh
```

## Dépannage

### Problèmes courants

1. **L'application n'est pas accessible**
   - Vérifiez que le serveur est en cours d'exécution
   - Vérifiez les règles de pare-feu
   - Consultez les journaux d'erreurs

2. **Erreurs de base de données**
   - Vérifiez que MongoDB est en cours d'exécution
   - Vérifiez les identifiants de connexion
   - Vérifiez l'espace disque disponible

3. **Problèmes de performance**
   - Augmentez les ressources du serveur
   - Optimisez les requêtes de base de données
   - Activez la mise en cache

### Journaux

Pour consulter les journaux de l'application :

```bash
# Journaux du backend
sudo journalctl -u printtrack-backend

# Journaux Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Support

Pour toute assistance supplémentaire, veuillez contacter :

- **Email :** support@printtrack.com
- **Téléphone :** +33 1 23 45 67 89
- **Site web :** https://printtrack.com/support

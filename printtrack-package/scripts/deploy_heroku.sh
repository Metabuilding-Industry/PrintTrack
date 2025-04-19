#!/bin/bash

# Script de déploiement pour PrintTrack sur Heroku
# Ce script automatise le déploiement de l'application PrintTrack sur Heroku

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Déploiement de PrintTrack sur Heroku ===${NC}"

# Vérifier si heroku CLI est installé
if ! command -v heroku &> /dev/null; then
  echo -e "${RED}Heroku CLI n'est pas installé.${NC}"
  echo -e "Veuillez l'installer en suivant les instructions sur: ${GREEN}https://devcenter.heroku.com/articles/heroku-cli${NC}"
  exit 1
fi

# Vérifier si l'authentification est configurée
if ! heroku auth:whoami &> /dev/null; then
  echo -e "${RED}Vous n'êtes pas authentifié avec Heroku.${NC}"
  echo -e "Veuillez vous authentifier avec: ${GREEN}heroku login${NC}"
  exit 1
fi

# Paramètres de déploiement
APP_NAME="printtrack-app"
MONGODB_ADDON="mongolab:sandbox"

# Demander les paramètres à l'utilisateur
echo -e "${YELLOW}Configuration du déploiement:${NC}"
read -p "Nom de l'application Heroku [$APP_NAME]: " input
APP_NAME=${input:-$APP_NAME}

echo -e "\nAddons MongoDB disponibles:"
echo "1. mongolab:sandbox (gratuit, 512MB)"
echo "2. mongolab:shared-single-small (payant, 1GB)"
echo "3. mongolab:shared-cluster-small (payant, 2GB)"
read -p "Choisissez un addon MongoDB [1]: " mongo_choice

case $mongo_choice in
  2)
    MONGODB_ADDON="mongolab:shared-single-small"
    ;;
  3)
    MONGODB_ADDON="mongolab:shared-cluster-small"
    ;;
  *)
    MONGODB_ADDON="mongolab:sandbox"
    ;;
esac

# Créer l'application Heroku
echo -e "${YELLOW}Création de l'application Heroku $APP_NAME...${NC}"
heroku create $APP_NAME

if [ $? -ne 0 ]; then
  echo -e "${RED}Échec de la création de l'application Heroku.${NC}"
  exit 1
fi

# Ajouter l'addon MongoDB
echo -e "${YELLOW}Ajout de l'addon MongoDB ($MONGODB_ADDON)...${NC}"
heroku addons:create $MONGODB_ADDON --app $APP_NAME

if [ $? -ne 0 ]; then
  echo -e "${RED}Échec de l'ajout de l'addon MongoDB.${NC}"
  echo -e "${YELLOW}Vérifiez que votre compte Heroku est vérifié pour les addons payants.${NC}"
  exit 1
fi

# Préparer le backend pour Heroku
echo -e "${YELLOW}Préparation du backend pour Heroku...${NC}"
TEMP_DIR="/tmp/printtrack-heroku"
mkdir -p $TEMP_DIR
cp -r /home/ubuntu/printtrack-package/backend/* $TEMP_DIR/

# Créer le fichier Procfile
echo "web: node dist/server.js" > $TEMP_DIR/Procfile

# Modifier le package.json pour ajouter les scripts Heroku
sed -i 's/"scripts": {/"scripts": {\n    "start": "node dist\/server.js",\n    "heroku-postbuild": "npm run build",/g' $TEMP_DIR/package.json

# Configurer les variables d'environnement
echo -e "${YELLOW}Configuration des variables d'environnement...${NC}"
heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set JWT_SECRET=printtrack_jwt_secret_key_production --app $APP_NAME
heroku config:set JWT_EXPIRE=30d --app $APP_NAME

# Déployer le backend sur Heroku
echo -e "${YELLOW}Déploiement du backend sur Heroku...${NC}"
cd $TEMP_DIR
git init
git add .
git commit -m "Initial commit"
git push heroku master

if [ $? -ne 0 ]; then
  echo -e "${RED}Échec du déploiement du backend sur Heroku.${NC}"
  exit 1
fi

# Préparer le frontend pour Netlify
echo -e "${YELLOW}Préparation du frontend pour Netlify...${NC}"
FRONTEND_DIR="/tmp/printtrack-netlify"
mkdir -p $FRONTEND_DIR
cp -r /home/ubuntu/printtrack-package/frontend/* $FRONTEND_DIR/

# Configurer l'URL de l'API dans le frontend
HEROKU_URL=$(heroku info -s --app $APP_NAME | grep web_url | cut -d= -f2 | tr -d '\n')
echo "REACT_APP_API_URL=$HEROKU_URL" > $FRONTEND_DIR/.env

# Construire le frontend
echo -e "${YELLOW}Construction du frontend...${NC}"
cd $FRONTEND_DIR
npm install
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Échec de la construction du frontend.${NC}"
  exit 1
fi

# Déployer le frontend sur Netlify (si netlify-cli est installé)
if command -v netlify &> /dev/null; then
  echo -e "${YELLOW}Déploiement du frontend sur Netlify...${NC}"
  cd $FRONTEND_DIR/build
  netlify deploy --prod
else
  echo -e "${YELLOW}netlify-cli n'est pas installé. Veuillez déployer manuellement le frontend:${NC}"
  echo -e "1. Installez netlify-cli: ${GREEN}npm install -g netlify-cli${NC}"
  echo -e "2. Authentifiez-vous: ${GREEN}netlify login${NC}"
  echo -e "3. Déployez: ${GREEN}cd $FRONTEND_DIR/build && netlify deploy --prod${NC}"
  echo -e "Ou utilisez l'interface web de Netlify pour déployer le dossier: ${GREEN}$FRONTEND_DIR/build${NC}"
fi

# Afficher les informations d'accès
echo -e "${GREEN}=== Déploiement terminé avec succès ! ===${NC}"
echo -e "Backend PrintTrack déployé sur: ${YELLOW}$HEROKU_URL${NC}"
echo -e "Frontend déployé sur Netlify (voir instructions ci-dessus si non automatique)"
echo -e "Identifiants par défaut:"
echo -e "  Email: ${YELLOW}admin@printtrack.com${NC}"
echo -e "  Mot de passe: ${YELLOW}admin123${NC}"
echo -e "\nPour des raisons de sécurité, veuillez changer le mot de passe après la première connexion."
echo -e "\nCommandes utiles:"
echo -e "  Voir les logs: ${YELLOW}heroku logs --tail --app $APP_NAME${NC}"
echo -e "  Ouvrir la console: ${YELLOW}heroku run bash --app $APP_NAME${NC}"
echo -e "  Redémarrer l'application: ${YELLOW}heroku restart --app $APP_NAME${NC}"

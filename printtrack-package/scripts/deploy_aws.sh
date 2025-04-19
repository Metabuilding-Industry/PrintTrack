#!/bin/bash

# Script de déploiement pour PrintTrack sur AWS Elastic Beanstalk
# Ce script automatise le déploiement de l'application PrintTrack sur AWS Elastic Beanstalk

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Déploiement de PrintTrack sur AWS Elastic Beanstalk ===${NC}"

# Vérifier si AWS CLI est installé
if ! command -v aws &> /dev/null; then
  echo -e "${RED}AWS CLI n'est pas installé.${NC}"
  echo -e "Veuillez l'installer en suivant les instructions sur: ${GREEN}https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html${NC}"
  exit 1
fi

# Vérifier si EB CLI est installé
if ! command -v eb &> /dev/null; then
  echo -e "${RED}Elastic Beanstalk CLI n'est pas installé.${NC}"
  echo -e "Veuillez l'installer en suivant les instructions sur: ${GREEN}https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html${NC}"
  exit 1
fi

# Vérifier si l'authentification est configurée
if ! aws sts get-caller-identity &> /dev/null; then
  echo -e "${RED}Vous n'êtes pas authentifié avec AWS.${NC}"
  echo -e "Veuillez vous authentifier avec: ${GREEN}aws configure${NC}"
  exit 1
fi

# Paramètres de déploiement
APP_NAME="printtrack-app"
ENV_NAME="printtrack-prod"
REGION="eu-west-1"  # Europe (Ireland), change selon votre localisation
INSTANCE_TYPE="t3.small"
PLATFORM="node.js-14"

# Demander les paramètres à l'utilisateur
echo -e "${YELLOW}Configuration du déploiement:${NC}"
read -p "Nom de l'application [$APP_NAME]: " input
APP_NAME=${input:-$APP_NAME}

read -p "Nom de l'environnement [$ENV_NAME]: " input
ENV_NAME=${input:-$ENV_NAME}

echo -e "\nRégions AWS disponibles:"
echo "1. us-east-1 (N. Virginia)"
echo "2. us-west-2 (Oregon)"
echo "3. eu-west-1 (Ireland)"
echo "4. eu-central-1 (Frankfurt)"
echo "5. ap-northeast-1 (Tokyo)"
read -p "Choisissez une région [3]: " region_choice

case $region_choice in
  1)
    REGION="us-east-1"
    ;;
  2)
    REGION="us-west-2"
    ;;
  4)
    REGION="eu-central-1"
    ;;
  5)
    REGION="ap-northeast-1"
    ;;
  *)
    REGION="eu-west-1"
    ;;
esac

echo -e "\nTypes d'instances disponibles:"
echo "1. t3.micro (2 vCPUs, 1 GB RAM)"
echo "2. t3.small (2 vCPUs, 2 GB RAM)"
echo "3. t3.medium (2 vCPUs, 4 GB RAM)"
read -p "Choisissez un type d'instance [2]: " instance_choice

case $instance_choice in
  1)
    INSTANCE_TYPE="t3.micro"
    ;;
  3)
    INSTANCE_TYPE="t3.medium"
    ;;
  *)
    INSTANCE_TYPE="t3.small"
    ;;
esac

# Préparer le backend pour Elastic Beanstalk
echo -e "${YELLOW}Préparation du backend pour Elastic Beanstalk...${NC}"
EB_DIR="/tmp/printtrack-eb"
mkdir -p $EB_DIR
cp -r /home/ubuntu/printtrack-package/backend/* $EB_DIR/

# Créer le fichier Procfile
echo "web: node dist/server.js" > $EB_DIR/Procfile

# Créer le fichier .ebextensions pour la configuration
mkdir -p $EB_DIR/.ebextensions
cat > $EB_DIR/.ebextensions/nodecommand.config << EOL
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
  aws:elasticbeanstalk:container:nodejs:staticfiles:
    /public: /public
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8081
EOL

# Initialiser l'application Elastic Beanstalk
echo -e "${YELLOW}Initialisation de l'application Elastic Beanstalk...${NC}"
cd $EB_DIR
eb init $APP_NAME --region $REGION --platform $PLATFORM

if [ $? -ne 0 ]; then
  echo -e "${RED}Échec de l'initialisation de l'application Elastic Beanstalk.${NC}"
  exit 1
fi

# Créer l'environnement Elastic Beanstalk
echo -e "${YELLOW}Création de l'environnement Elastic Beanstalk...${NC}"
eb create $ENV_NAME --instance-type $INSTANCE_TYPE --single

if [ $? -ne 0 ]; then
  echo -e "${RED}Échec de la création de l'environnement Elastic Beanstalk.${NC}"
  exit 1
fi

# Configurer les variables d'environnement
echo -e "${YELLOW}Configuration des variables d'environnement...${NC}"
eb setenv NODE_ENV=production JWT_SECRET=printtrack_jwt_secret_key_production JWT_EXPIRE=30d

# Déployer l'application
echo -e "${YELLOW}Déploiement de l'application...${NC}"
eb deploy

if [ $? -ne 0 ]; then
  echo -e "${RED}Échec du déploiement de l'application.${NC}"
  exit 1
fi

# Obtenir l'URL de l'application
APP_URL=$(eb status | grep CNAME | awk '{print $2}')

# Préparer le frontend pour S3/CloudFront
echo -e "${YELLOW}Préparation du frontend pour S3/CloudFront...${NC}"
FRONTEND_DIR="/tmp/printtrack-s3"
mkdir -p $FRONTEND_DIR
cp -r /home/ubuntu/printtrack-package/frontend/* $FRONTEND_DIR/

# Configurer l'URL de l'API dans le frontend
echo "REACT_APP_API_URL=http://$APP_URL" > $FRONTEND_DIR/.env

# Construire le frontend
echo -e "${YELLOW}Construction du frontend...${NC}"
cd $FRONTEND_DIR
npm install
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Échec de la construction du frontend.${NC}"
  exit 1
fi

# Créer un bucket S3
BUCKET_NAME="printtrack-frontend-$(date +%Y%m%d%H%M%S)"
echo -e "${YELLOW}Création du bucket S3 $BUCKET_NAME...${NC}"
aws s3 mb s3://$BUCKET_NAME --region $REGION

if [ $? -ne 0 ]; then
  echo -e "${RED}Échec de la création du bucket S3.${NC}"
  exit 1
fi

# Configurer le bucket pour l'hébergement de site web statique
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Définir la politique du bucket pour permettre l'accès public
cat > /tmp/bucket-policy.json << EOL
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOL

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json

# Uploader les fichiers du frontend vers S3
echo -e "${YELLOW}Upload des fichiers du frontend vers S3...${NC}"
aws s3 sync $FRONTEND_DIR/build/ s3://$BUCKET_NAME/ --acl public-read

if [ $? -ne 0 ]; then
  echo -e "${RED}Échec de l'upload des fichiers vers S3.${NC}"
  exit 1
fi

# Obtenir l'URL du site S3
S3_URL="http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"

# Afficher les informations d'accès
echo -e "${GREEN}=== Déploiement terminé avec succès ! ===${NC}"
echo -e "Backend PrintTrack déployé sur: ${YELLOW}http://$APP_URL${NC}"
echo -e "Frontend déployé sur: ${YELLOW}$S3_URL${NC}"
echo -e "Identifiants par défaut:"
echo -e "  Email: ${YELLOW}admin@printtrack.com${NC}"
echo -e "  Mot de passe: ${YELLOW}admin123${NC}"
echo -e "\nPour des raisons de sécurité, veuillez changer le mot de passe après la première connexion."
echo -e "\nCommandes utiles:"
echo -e "  Voir les logs: ${YELLOW}eb logs${NC}"
echo -e "  Se connecter à l'instance: ${YELLOW}eb ssh${NC}"
echo -e "  Mettre à jour l'application: ${YELLOW}eb deploy${NC}"
echo -e "  Mettre à jour le frontend: ${YELLOW}aws s3 sync $FRONTEND_DIR/build/ s3://$BUCKET_NAME/ --acl public-read${NC}"

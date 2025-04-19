#!/bin/bash

# Script de déploiement pour PrintTrack sur DigitalOcean
# Ce script automatise le déploiement de l'application PrintTrack sur un Droplet DigitalOcean

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Déploiement de PrintTrack sur DigitalOcean ===${NC}"

# Vérifier si doctl est installé
if ! command -v doctl &> /dev/null; then
  echo -e "${RED}doctl (DigitalOcean CLI) n'est pas installé.${NC}"
  echo -e "Veuillez l'installer en suivant les instructions sur: ${GREEN}https://github.com/digitalocean/doctl${NC}"
  exit 1
fi

# Vérifier si l'authentification est configurée
if ! doctl account get &> /dev/null; then
  echo -e "${RED}Vous n'êtes pas authentifié avec DigitalOcean.${NC}"
  echo -e "Veuillez vous authentifier avec: ${GREEN}doctl auth init${NC}"
  exit 1
fi

# Paramètres de déploiement
DROPLET_NAME="printtrack-app"
REGION="fra1"  # Frankfurt, change selon votre localisation
SIZE="s-2vcpu-4gb"  # 2 vCPUs, 4 GB RAM
IMAGE="ubuntu-20-04-x64"
SSH_KEY_NAME=""
SSH_KEY_PATH=""

# Demander les paramètres à l'utilisateur
echo -e "${YELLOW}Configuration du déploiement:${NC}"
read -p "Nom du Droplet [$DROPLET_NAME]: " input
DROPLET_NAME=${input:-$DROPLET_NAME}

echo -e "\nRégions disponibles:"
doctl compute region list
read -p "Région [$REGION]: " input
REGION=${input:-$REGION}

echo -e "\nTailles disponibles:"
doctl compute size list
read -p "Taille [$SIZE]: " input
SIZE=${input:-$SIZE}

echo -e "\nClés SSH disponibles:"
doctl compute ssh-key list
read -p "Nom de la clé SSH à utiliser: " SSH_KEY_NAME
if [ -z "$SSH_KEY_NAME" ]; then
  echo -e "${YELLOW}Aucune clé SSH spécifiée. Création d'un Droplet avec mot de passe.${NC}"
  SSH_KEY_ID=""
else
  SSH_KEY_ID=$(doctl compute ssh-key list --format ID,Name --no-header | grep "$SSH_KEY_NAME" | awk '{print $1}')
  if [ -z "$SSH_KEY_ID" ]; then
    echo -e "${RED}Clé SSH '$SSH_KEY_NAME' non trouvée.${NC}"
    exit 1
  fi
  read -p "Chemin vers la clé SSH privée: " SSH_KEY_PATH
  if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${RED}Fichier de clé SSH '$SSH_KEY_PATH' non trouvé.${NC}"
    exit 1
  fi
fi

# Créer le Droplet
echo -e "${YELLOW}Création du Droplet $DROPLET_NAME...${NC}"
if [ -z "$SSH_KEY_ID" ]; then
  DROPLET_ID=$(doctl compute droplet create $DROPLET_NAME --region $REGION --size $SIZE --image $IMAGE --wait --format ID --no-header)
else
  DROPLET_ID=$(doctl compute droplet create $DROPLET_NAME --region $REGION --size $SIZE --image $IMAGE --ssh-keys $SSH_KEY_ID --wait --format ID --no-header)
fi

if [ -z "$DROPLET_ID" ]; then
  echo -e "${RED}Échec de la création du Droplet.${NC}"
  exit 1
fi

echo -e "${GREEN}Droplet créé avec l'ID: $DROPLET_ID${NC}"

# Attendre que le Droplet soit prêt
echo -e "${YELLOW}Attente de l'initialisation du Droplet...${NC}"
sleep 60

# Obtenir l'adresse IP du Droplet
IP_ADDRESS=$(doctl compute droplet get $DROPLET_ID --format PublicIPv4 --no-header)
echo -e "${GREEN}Adresse IP du Droplet: $IP_ADDRESS${NC}"

# Préparer le package d'installation
echo -e "${YELLOW}Préparation du package d'installation...${NC}"
PACKAGE_DIR="/tmp/printtrack-deploy"
mkdir -p $PACKAGE_DIR
cp -r /home/ubuntu/printtrack-package/* $PACKAGE_DIR/

# Rendre les scripts exécutables
chmod +x $PACKAGE_DIR/scripts/*.sh

# Transférer le package vers le Droplet
echo -e "${YELLOW}Transfert du package vers le Droplet...${NC}"
if [ -z "$SSH_KEY_PATH" ]; then
  echo -e "${YELLOW}Veuillez saisir le mot de passe root lorsque demandé.${NC}"
  scp -r -o StrictHostKeyChecking=no $PACKAGE_DIR/* root@$IP_ADDRESS:/root/
else
  scp -r -o StrictHostKeyChecking=no -i $SSH_KEY_PATH $PACKAGE_DIR/* root@$IP_ADDRESS:/root/
fi

# Exécuter le script d'installation sur le Droplet
echo -e "${YELLOW}Installation de PrintTrack sur le Droplet...${NC}"
if [ -z "$SSH_KEY_PATH" ]; then
  ssh -o StrictHostKeyChecking=no root@$IP_ADDRESS "cd /root/scripts && chmod +x install.sh && ./install.sh"
else
  ssh -o StrictHostKeyChecking=no -i $SSH_KEY_PATH root@$IP_ADDRESS "cd /root/scripts && chmod +x install.sh && ./install.sh"
fi

# Configurer le pare-feu
echo -e "${YELLOW}Configuration du pare-feu...${NC}"
doctl compute firewall create --name $DROPLET_NAME-firewall --droplet-ids $DROPLET_ID --inbound-rules "protocol:tcp,ports:22,address:0.0.0.0/0 protocol:tcp,ports:80,address:0.0.0.0/0 protocol:tcp,ports:443,address:0.0.0.0/0" --outbound-rules "protocol:tcp,ports:all,address:0.0.0.0/0 protocol:udp,ports:all,address:0.0.0.0/0 protocol:icmp,ports:all,address:0.0.0.0/0"

# Afficher les informations d'accès
echo -e "${GREEN}=== Déploiement terminé avec succès ! ===${NC}"
echo -e "PrintTrack est maintenant accessible à l'adresse: ${YELLOW}http://$IP_ADDRESS${NC}"
echo -e "Identifiants par défaut:"
echo -e "  Email: ${YELLOW}admin@printtrack.com${NC}"
echo -e "  Mot de passe: ${YELLOW}admin123${NC}"
echo -e "\nPour vous connecter au serveur:"
if [ -z "$SSH_KEY_PATH" ]; then
  echo -e "  ${YELLOW}ssh root@$IP_ADDRESS${NC}"
else
  echo -e "  ${YELLOW}ssh -i $SSH_KEY_PATH root@$IP_ADDRESS${NC}"
fi
echo -e "\nPour des raisons de sécurité, veuillez changer le mot de passe après la première connexion."

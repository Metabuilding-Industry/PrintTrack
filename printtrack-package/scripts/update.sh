#!/bin/bash

# Script de mise à jour de PrintTrack
# Ce script met à jour l'application PrintTrack vers la dernière version

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Mise à jour de PrintTrack ===${NC}"

# Vérifier si nous sommes root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Ce script doit être exécuté avec les privilèges sudo.${NC}"
  echo -e "Veuillez réessayer avec: ${GREEN}sudo ./update.sh${NC}"
  exit 1
fi

# Définir le répertoire d'installation
INSTALL_DIR="/opt/printtrack"
BACKUP_DIR="/opt/printtrack_backup_$(date +%Y%m%d%H%M%S)"

echo -e "${YELLOW}Sauvegarde de l'installation existante dans $BACKUP_DIR...${NC}"
mkdir -p $BACKUP_DIR
cp -r $INSTALL_DIR/* $BACKUP_DIR/

# Sauvegarde de la base de données
echo -e "${YELLOW}Sauvegarde de la base de données...${NC}"
mkdir -p $BACKUP_DIR/database_dump
mongodump --db printtrack --out $BACKUP_DIR/database_dump

# Arrêter le service backend
echo -e "${YELLOW}Arrêt du service backend...${NC}"
systemctl stop printtrack-backend

# Mettre à jour le backend
echo -e "${YELLOW}Mise à jour du backend...${NC}"
cp -r ../backend/* $INSTALL_DIR/backend/
cp $BACKUP_DIR/backend/.env $INSTALL_DIR/backend/ # Restaurer le fichier .env
chown -R printtrack:printtrack $INSTALL_DIR/backend
su - printtrack -c "cd $INSTALL_DIR/backend && npm install"
su - printtrack -c "cd $INSTALL_DIR/backend && npm run build"

# Mettre à jour le frontend
echo -e "${YELLOW}Mise à jour du frontend...${NC}"
cp -r ../frontend/* $INSTALL_DIR/frontend/
cp $BACKUP_DIR/frontend/.env $INSTALL_DIR/frontend/ # Restaurer le fichier .env
chown -R printtrack:printtrack $INSTALL_DIR/frontend
su - printtrack -c "cd $INSTALL_DIR/frontend && npm install"
su - printtrack -c "cd $INSTALL_DIR/frontend && npm run build"

# Redémarrer le service backend
echo -e "${YELLOW}Redémarrage du service backend...${NC}"
systemctl start printtrack-backend

# Afficher les informations d'accès
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}=== Mise à jour terminée avec succès ! ===${NC}"
echo -e "PrintTrack est maintenant accessible à l'adresse: ${YELLOW}http://$IP_ADDRESS${NC}"
echo -e "En cas de problème, vous pouvez restaurer la sauvegarde depuis: ${YELLOW}$BACKUP_DIR${NC}"

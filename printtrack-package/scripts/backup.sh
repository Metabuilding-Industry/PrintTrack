#!/bin/bash

# Script de sauvegarde pour PrintTrack
# Ce script sauvegarde la base de données et les fichiers de configuration

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Sauvegarde de PrintTrack ===${NC}"

# Vérifier si nous sommes root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Ce script doit être exécuté avec les privilèges sudo.${NC}"
  echo -e "Veuillez réessayer avec: ${GREEN}sudo ./backup.sh${NC}"
  exit 1
fi

# Définir les répertoires
INSTALL_DIR="/opt/printtrack"
BACKUP_DIR="/opt/printtrack_backups/backup_$(date +%Y%m%d%H%M%S)"
RETENTION_DAYS=7

# Créer le répertoire de sauvegarde
echo -e "${YELLOW}Création du répertoire de sauvegarde $BACKUP_DIR...${NC}"
mkdir -p $BACKUP_DIR

# Sauvegarder les fichiers de configuration
echo -e "${YELLOW}Sauvegarde des fichiers de configuration...${NC}"
mkdir -p $BACKUP_DIR/config
cp $INSTALL_DIR/backend/.env $BACKUP_DIR/config/backend.env
cp $INSTALL_DIR/frontend/.env $BACKUP_DIR/config/frontend.env

# Sauvegarder la base de données
echo -e "${YELLOW}Sauvegarde de la base de données...${NC}"
mkdir -p $BACKUP_DIR/database
mongodump --db printtrack --out $BACKUP_DIR/database

# Compresser la sauvegarde
echo -e "${YELLOW}Compression de la sauvegarde...${NC}"
cd /opt/printtrack_backups
tar -czf backup_$(date +%Y%m%d%H%M%S).tar.gz $(basename $BACKUP_DIR)
rm -rf $BACKUP_DIR

# Nettoyer les anciennes sauvegardes
echo -e "${YELLOW}Nettoyage des anciennes sauvegardes...${NC}"
find /opt/printtrack_backups -name "backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

echo -e "${GREEN}=== Sauvegarde terminée avec succès ! ===${NC}"
echo -e "La sauvegarde a été enregistrée dans: ${YELLOW}/opt/printtrack_backups/backup_$(date +%Y%m%d%H%M%S).tar.gz${NC}"
echo -e "Les sauvegardes de plus de $RETENTION_DAYS jours ont été supprimées."

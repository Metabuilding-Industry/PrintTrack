#!/bin/bash

# Script d'installation de PrintTrack
# Ce script installe l'application PrintTrack sur un serveur Linux

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Installation de PrintTrack ===${NC}"

# Vérifier si nous sommes root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Ce script doit être exécuté avec les privilèges sudo.${NC}"
  echo -e "Veuillez réessayer avec: ${GREEN}sudo ./install.sh${NC}"
  exit 1
fi

# Vérifier les prérequis
echo -e "${YELLOW}Vérification des prérequis...${NC}"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Node.js n'est pas installé. Installation...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
  apt-get install -y nodejs
  echo -e "${GREEN}Node.js installé avec succès.${NC}"
else
  echo -e "${GREEN}Node.js est déjà installé.${NC}"
fi

# Vérifier MongoDB
if ! command -v mongod &> /dev/null; then
  echo -e "${YELLOW}MongoDB n'est pas installé. Installation...${NC}"
  wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
  echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
  apt-get update
  apt-get install -y mongodb-org
  systemctl start mongod
  systemctl enable mongod
  echo -e "${GREEN}MongoDB installé et démarré avec succès.${NC}"
else
  echo -e "${GREEN}MongoDB est déjà installé.${NC}"
fi

# Vérifier Nginx
if ! command -v nginx &> /dev/null; then
  echo -e "${YELLOW}Nginx n'est pas installé. Installation...${NC}"
  apt-get install -y nginx
  systemctl start nginx
  systemctl enable nginx
  echo -e "${GREEN}Nginx installé et démarré avec succès.${NC}"
else
  echo -e "${GREEN}Nginx est déjà installé.${NC}"
fi

# Créer l'utilisateur de l'application
echo -e "${YELLOW}Création de l'utilisateur printtrack...${NC}"
if id "printtrack" &>/dev/null; then
  echo -e "${GREEN}L'utilisateur printtrack existe déjà.${NC}"
else
  useradd -m -s /bin/bash printtrack
  echo -e "${GREEN}Utilisateur printtrack créé avec succès.${NC}"
fi

# Définir le répertoire d'installation
INSTALL_DIR="/opt/printtrack"
echo -e "${YELLOW}Installation dans $INSTALL_DIR...${NC}"

# Créer le répertoire d'installation
mkdir -p $INSTALL_DIR
chown printtrack:printtrack $INSTALL_DIR

# Copier les fichiers
echo -e "${YELLOW}Copie des fichiers...${NC}"
cp -r ../backend $INSTALL_DIR/
cp -r ../frontend $INSTALL_DIR/
cp -r ../database $INSTALL_DIR/
chown -R printtrack:printtrack $INSTALL_DIR

# Configurer le backend
echo -e "${YELLOW}Configuration du backend...${NC}"
cd $INSTALL_DIR/backend
su - printtrack -c "cd $INSTALL_DIR/backend && npm install"
cp .env.example .env
sed -i 's/mongodb:\/\/localhost:27017\/printtrack/mongodb:\/\/localhost:27017\/printtrack?authSource=admin/' .env
su - printtrack -c "cd $INSTALL_DIR/backend && npm run build"

# Configurer le frontend
echo -e "${YELLOW}Configuration du frontend...${NC}"
cd $INSTALL_DIR/frontend
su - printtrack -c "cd $INSTALL_DIR/frontend && npm install"
cp .env.example .env
sed -i "s/REACT_APP_API_URL=http:\/\/localhost:5000/REACT_APP_API_URL=http:\/\/$(hostname -I | awk '{print $1}'):5000/" .env
su - printtrack -c "cd $INSTALL_DIR/frontend && npm run build"

# Configurer la base de données
echo -e "${YELLOW}Configuration de la base de données...${NC}"
cd $INSTALL_DIR/database
if [ -d "dump" ]; then
  mongorestore --db printtrack dump/printtrack
  echo -e "${GREEN}Base de données restaurée avec succès.${NC}"
else
  echo -e "${YELLOW}Aucun dump de base de données trouvé. Une base de données vide sera utilisée.${NC}"
fi

# Configurer le service systemd pour le backend
echo -e "${YELLOW}Configuration du service backend...${NC}"
cat > /etc/systemd/system/printtrack-backend.service << EOL
[Unit]
Description=PrintTrack Backend
After=network.target mongodb.service

[Service]
Type=simple
User=printtrack
WorkingDirectory=$INSTALL_DIR/backend
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

# Configurer Nginx
echo -e "${YELLOW}Configuration de Nginx...${NC}"
cat > /etc/nginx/sites-available/printtrack << EOL
server {
    listen 80;
    server_name _;

    location / {
        root $INSTALL_DIR/frontend/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Activer le site Nginx
ln -sf /etc/nginx/sites-available/printtrack /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl reload nginx

# Démarrer le service backend
echo -e "${YELLOW}Démarrage du service backend...${NC}"
systemctl daemon-reload
systemctl enable printtrack-backend
systemctl start printtrack-backend

# Afficher les informations d'accès
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}=== Installation terminée avec succès ! ===${NC}"
echo -e "PrintTrack est maintenant accessible à l'adresse: ${YELLOW}http://$IP_ADDRESS${NC}"
echo -e "Identifiants par défaut:"
echo -e "  Email: ${YELLOW}admin@printtrack.com${NC}"
echo -e "  Mot de passe: ${YELLOW}admin123${NC}"
echo -e "\nPour des raisons de sécurité, veuillez changer le mot de passe après la première connexion."

#!/bin/bash

# Script de déploiement pour l'application PrintTrack

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Démarrage du déploiement de l'application PrintTrack ===${NC}"

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d "/home/ubuntu/printtrack-app" ]; then
  echo -e "${RED}Erreur: Le répertoire de l'application n'existe pas.${NC}"
  exit 1
fi

# Créer le répertoire de déploiement
DEPLOY_DIR="/home/ubuntu/printtrack-deploy"
mkdir -p $DEPLOY_DIR

echo -e "${YELLOW}=== Construction du frontend ===${NC}"
cd /home/ubuntu/printtrack-app/frontend

# Installer les dépendances
echo "Installation des dépendances frontend..."
npm install

# Construire l'application frontend
echo "Construction du frontend..."
npm run build

# Copier les fichiers de build dans le répertoire de déploiement
echo "Copie des fichiers frontend vers le répertoire de déploiement..."
mkdir -p $DEPLOY_DIR/frontend
cp -r build/* $DEPLOY_DIR/frontend/

echo -e "${GREEN}Frontend construit avec succès.${NC}"

echo -e "${YELLOW}=== Construction du backend ===${NC}"
cd /home/ubuntu/printtrack-app/backend

# Installer les dépendances
echo "Installation des dépendances backend..."
npm install

# Transpiler le code TypeScript
echo "Transpilation du code TypeScript..."
npx tsc

# Copier les fichiers nécessaires dans le répertoire de déploiement
echo "Copie des fichiers backend vers le répertoire de déploiement..."
mkdir -p $DEPLOY_DIR/backend
cp -r dist package.json package-lock.json .env.example $DEPLOY_DIR/backend/

echo -e "${GREEN}Backend construit avec succès.${NC}"

# Créer le fichier .env pour la production
echo "Configuration des variables d'environnement pour la production..."
cat > $DEPLOY_DIR/backend/.env << EOL
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://printtrack:printtrack123@cluster0.mongodb.net/printtrack?retryWrites=true&w=majority
JWT_SECRET=printtrack_jwt_secret_key_production
JWT_EXPIRE=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=printtrack@gmail.com
SMTP_PASS=printtrack_smtp_password
FROM_EMAIL=printtrack@gmail.com
FROM_NAME=PrintTrack
EOL

# Créer le fichier docker-compose.yml
echo "Création du fichier docker-compose.yml..."
cat > $DEPLOY_DIR/docker-compose.yml << EOL
version: '3'

services:
  backend:
    build:
      context: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    restart: always
    volumes:
      - ./backend:/usr/src/app
      - /usr/src/app/node_modules
    networks:
      - printtrack-network

  frontend:
    build:
      context: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
    networks:
      - printtrack-network

networks:
  printtrack-network:
    driver: bridge
EOL

# Créer le Dockerfile pour le backend
echo "Création du Dockerfile pour le backend..."
cat > $DEPLOY_DIR/backend/Dockerfile << EOL
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "dist/server.js"]
EOL

# Créer le Dockerfile pour le frontend
echo "Création du Dockerfile pour le frontend..."
mkdir -p $DEPLOY_DIR/frontend
cat > $DEPLOY_DIR/frontend/Dockerfile << EOL
FROM nginx:alpine

COPY . /usr/share/nginx/html

# Configuration pour le routage SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:5000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade \$http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host \$host; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOL

echo -e "${GREEN}Configuration de déploiement créée avec succès.${NC}"

# Créer un script de démarrage
echo "Création du script de démarrage..."
cat > $DEPLOY_DIR/start.sh << EOL
#!/bin/bash
docker-compose up -d
EOL
chmod +x $DEPLOY_DIR/start.sh

# Créer un script d'arrêt
echo "Création du script d'arrêt..."
cat > $DEPLOY_DIR/stop.sh << EOL
#!/bin/bash
docker-compose down
EOL
chmod +x $DEPLOY_DIR/stop.sh

echo -e "${GREEN}=== Déploiement préparé avec succès ! ===${NC}"
echo -e "Le déploiement est prêt dans le répertoire: ${YELLOW}$DEPLOY_DIR${NC}"
echo -e "Pour démarrer l'application, exécutez: ${YELLOW}cd $DEPLOY_DIR && ./start.sh${NC}"
echo -e "Pour arrêter l'application, exécutez: ${YELLOW}cd $DEPLOY_DIR && ./stop.sh${NC}"

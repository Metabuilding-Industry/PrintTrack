// Fichier de configuration pour MongoDB Atlas
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// URI de connexion MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/printtrack';

// Options de connexion
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4 // Utiliser IPv4, éviter les problèmes avec IPv6
};

// Fonction de connexion à MongoDB Atlas
export const connectToAtlas = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connexion à MongoDB Atlas établie avec succès');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB Atlas:', error);
    process.exit(1);
  }
};

// Fonction pour vérifier l'état de la connexion
export const checkConnection = (): boolean => {
  return mongoose.connection.readyState === 1; // 1 = connecté
};

// Fonction pour fermer la connexion
export const closeConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('Connexion à MongoDB Atlas fermée avec succès');
  } catch (error) {
    console.error('Erreur lors de la fermeture de la connexion:', error);
  }
};

export default {
  connectToAtlas,
  checkConnection,
  closeConnection
};

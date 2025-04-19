// Configuration de la base de données MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// URI de connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/printtrack';

// Options de connexion
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
};

// Fonction de connexion à la base de données
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connexion à MongoDB établie avec succès');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

// Gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('Mongoose connecté à', MONGODB_URI);
});

mongoose.connection.on('error', (err) => {
  console.error('Erreur de connexion Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose déconnecté');
});

// Fermeture propre de la connexion lors de l'arrêt de l'application
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Connexion Mongoose fermée suite à l\'arrêt de l\'application');
  process.exit(0);
});

export default mongoose;

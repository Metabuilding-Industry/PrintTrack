import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import bonsFabricationRoutes from './routes/bonsFabricationRoutes';
import clientsRoutes from './routes/clientsRoutes';
import machinesRoutes from './routes/machinesRoutes';
import parametresTechniquesRoutes from './routes/parametresTechniquesRoutes';
import controleQualiteRoutes from './routes/controleQualiteRoutes';
import incidentsRoutes from './routes/incidentsRoutes';
import rapportsRoutes from './routes/rapportsRoutes';
import statistiquesRoutes from './routes/statistiquesRoutes';
import { errorHandler } from './middleware/errorMiddleware';

// Configuration des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet());

// Middleware de limitation de débit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware pour le parsing du corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour les CORS
app.use(cors());

// Middleware de logging
app.use(morgan('dev'));

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/printtrack')
  .then(() => {
    console.log('Connexion à MongoDB établie avec succès');
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
  });

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/bons', bonsFabricationRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/parametres', parametresTechniquesRoutes);
app.use('/api/controles', controleQualiteRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/statistiques', statistiquesRoutes);

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({ message: 'API PrintTrack fonctionnelle' });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app;

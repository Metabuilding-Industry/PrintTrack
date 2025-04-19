// Script de seeding pour la base de données
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Client from '../models/Client';
import Machine from '../models/Machine';
import { connectDB } from '../config/database';

// Charger les variables d'environnement
dotenv.config();

// Données initiales pour les utilisateurs
const users = [
  {
    username: 'admin',
    email: 'admin@printtrack.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'Système',
    role: 'admin',
    isActive: true
  },
  {
    username: 'superviseur',
    email: 'superviseur@printtrack.com',
    password: 'super123',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'supervisor',
    isActive: true
  },
  {
    username: 'operateur1',
    email: 'operateur1@printtrack.com',
    password: 'oper123',
    firstName: 'Marie',
    lastName: 'Martin',
    role: 'operator',
    isActive: true
  },
  {
    username: 'operateur2',
    email: 'operateur2@printtrack.com',
    password: 'oper123',
    firstName: 'Pierre',
    lastName: 'Durand',
    role: 'operator',
    isActive: true
  }
];

// Données initiales pour les clients
const clients = [
  {
    nom: 'Imprimerie Moderne',
    contact: 'Sophie Leroy',
    adresse: '15 rue de la Presse, 75001 Paris',
    telephone: '01 23 45 67 89',
    email: 'contact@imprimerie-moderne.fr',
    preferences: {
      procede: 'offset',
      delaiLivraison: 5,
      formatPreference: ['A4', 'A3'],
      supportPreference: ['Couché mat', 'Couché brillant']
    },
    actif: true
  },
  {
    nom: 'Éditions du Soleil',
    contact: 'Marc Dubois',
    adresse: '8 avenue des Éditeurs, 69002 Lyon',
    telephone: '04 56 78 90 12',
    email: 'contact@editions-soleil.fr',
    preferences: {
      procede: 'les_deux',
      delaiLivraison: 10,
      formatPreference: ['A5', 'A4'],
      supportPreference: ['Offset', 'Recyclé']
    },
    actif: true
  },
  {
    nom: 'Packaging Premium',
    contact: 'Lucie Moreau',
    adresse: '25 boulevard de l\'Industrie, 33000 Bordeaux',
    telephone: '05 67 89 01 23',
    email: 'contact@packaging-premium.fr',
    preferences: {
      procede: 'heliogravure',
      delaiLivraison: 7,
      formatPreference: ['Personnalisé'],
      supportPreference: ['Carton', 'PVC']
    },
    actif: true
  }
];

// Données initiales pour les machines
const machines = [
  {
    nom: 'Offset Heidelberg XL 106',
    type: 'offset',
    procede: 'Offset feuilles',
    caracteristiques: '8 couleurs + vernis, format max 106x77cm',
    dateInstallation: new Date('2022-03-15'),
    dateDerniereRevision: new Date('2023-11-10'),
    statut: 'disponible',
    capaciteProduction: {
      vitesseMax: 18000,
      formatMax: '106x77cm',
      formatMin: '21x29.7cm'
    },
    maintenancePlanifiee: new Date('2024-05-20')
  },
  {
    nom: 'Offset Komori GL-840',
    type: 'offset',
    procede: 'Offset feuilles',
    caracteristiques: '8 couleurs, format max 72x102cm',
    dateInstallation: new Date('2021-06-22'),
    dateDerniereRevision: new Date('2023-12-05'),
    statut: 'en_production',
    capaciteProduction: {
      vitesseMax: 16000,
      formatMax: '72x102cm',
      formatMin: '21x29.7cm'
    },
    maintenancePlanifiee: new Date('2024-06-15')
  },
  {
    nom: 'Héliogravure KBA RotaJET',
    type: 'heliogravure',
    procede: 'Héliogravure rotative',
    caracteristiques: 'Rotative 8 groupes, laize 1450mm',
    dateInstallation: new Date('2023-01-10'),
    dateDerniereRevision: new Date('2023-10-15'),
    statut: 'disponible',
    capaciteProduction: {
      vitesseMax: 45000,
      formatMax: '1450mm',
      formatMin: '500mm'
    }
  },
  {
    nom: 'Héliogravure Bobst MW 85F',
    type: 'heliogravure',
    procede: 'Héliogravure feuilles',
    caracteristiques: '6 groupes, format max 85x120cm',
    dateInstallation: new Date('2022-09-05'),
    dateDerniereRevision: new Date('2023-09-20'),
    statut: 'en_maintenance',
    capaciteProduction: {
      vitesseMax: 12000,
      formatMax: '85x120cm',
      formatMin: '30x40cm'
    },
    maintenancePlanifiee: new Date('2024-04-30')
  }
];

// Fonction pour importer les données
const importData = async () => {
  try {
    await connectDB();
    
    // Supprimer les données existantes
    await User.deleteMany({});
    await Client.deleteMany({});
    await Machine.deleteMany({});
    
    // Importer les nouvelles données
    await User.insertMany(users);
    await Client.insertMany(clients);
    await Machine.insertMany(machines);
    
    console.log('Données importées avec succès');
    process.exit();
  } catch (error) {
    console.error('Erreur lors de l\'importation des données:', error);
    process.exit(1);
  }
};

// Fonction pour supprimer les données
const destroyData = async () => {
  try {
    await connectDB();
    
    await User.deleteMany({});
    await Client.deleteMany({});
    await Machine.deleteMany({});
    
    console.log('Données supprimées avec succès');
    process.exit();
  } catch (error) {
    console.error('Erreur lors de la suppression des données:', error);
    process.exit(1);
  }
};

// Exécuter la fonction appropriée selon l'argument de ligne de commande
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

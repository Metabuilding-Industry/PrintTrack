// Script de migration pour la base de données
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectToAtlas } from './config/atlas';

// Charger les variables d'environnement
dotenv.config();

// Fonction pour exécuter les migrations
const runMigrations = async () => {
  try {
    // Connexion à la base de données
    await connectToAtlas();
    console.log('Connexion établie pour les migrations');
    
    // Créer une collection pour suivre les migrations
    const db = mongoose.connection.db;
    const migrationCollection = db.collection('migrations');
    
    // Vérifier si la collection de migrations existe
    const collections = await db.listCollections({ name: 'migrations' }).toArray();
    if (collections.length === 0) {
      console.log('Création de la collection de migrations');
      await db.createCollection('migrations');
    }
    
    // Liste des migrations à exécuter
    const migrations = [
      {
        version: '1.0.0',
        description: 'Migration initiale',
        up: async () => {
          console.log('Exécution de la migration 1.0.0');
          // Aucune opération nécessaire pour la migration initiale
        }
      },
      {
        version: '1.0.1',
        description: 'Ajout des index pour améliorer les performances',
        up: async () => {
          console.log('Exécution de la migration 1.0.1');
          // Création d'index pour les collections principales
          await db.collection('users').createIndex({ username: 1 }, { unique: true });
          await db.collection('users').createIndex({ email: 1 }, { unique: true });
          await db.collection('bonfabrications').createIndex({ numero: 1 }, { unique: true });
          await db.collection('bonfabrications').createIndex({ client: 1 });
          await db.collection('bonfabrications').createIndex({ machine: 1 });
          await db.collection('bonfabrications').createIndex({ etat: 1 });
          await db.collection('clients').createIndex({ nom: 1 }, { unique: true });
          await db.collection('machines').createIndex({ nom: 1 }, { unique: true });
          await db.collection('incidents').createIndex({ bonFabrication: 1 });
          await db.collection('incidents').createIndex({ statut: 1 });
          await db.collection('parametretechniques').createIndex({ bonFabrication: 1 });
          await db.collection('controlequalites').createIndex({ bonFabrication: 1 });
        }
      }
    ];
    
    // Exécuter les migrations qui n'ont pas encore été appliquées
    for (const migration of migrations) {
      // Vérifier si la migration a déjà été appliquée
      const existingMigration = await migrationCollection.findOne({ version: migration.version });
      
      if (!existingMigration) {
        console.log(`Application de la migration ${migration.version}: ${migration.description}`);
        
        // Exécuter la migration
        await migration.up();
        
        // Enregistrer la migration comme appliquée
        await migrationCollection.insertOne({
          version: migration.version,
          description: migration.description,
          appliedAt: new Date()
        });
        
        console.log(`Migration ${migration.version} appliquée avec succès`);
      } else {
        console.log(`Migration ${migration.version} déjà appliquée`);
      }
    }
    
    console.log('Toutes les migrations ont été appliquées');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'exécution des migrations:', error);
    process.exit(1);
  }
};

// Exécuter les migrations
runMigrations();

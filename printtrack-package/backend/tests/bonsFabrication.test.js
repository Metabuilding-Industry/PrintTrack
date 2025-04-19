import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/server';
import User from '../src/models/User';
import BonFabrication from '../src/models/BonFabrication';
import Client from '../src/models/Client';
import Machine from '../src/models/Machine';
import { connectDB } from '../src/config/database';

// Mock des modèles
jest.mock('../src/models/User');
jest.mock('../src/models/BonFabrication');
jest.mock('../src/models/Client');
jest.mock('../src/models/Machine');

// Mock de la connexion à la base de données
jest.mock('../src/config/database', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined)
}));

describe('API Routes - Bons de Fabrication', () => {
  let token;
  
  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();
    
    // Mock du token JWT pour l'authentification
    token = 'Bearer test_token';
    
    // Mock de la vérification du token
    jest.spyOn(mongoose, 'connect').mockResolvedValue(undefined);
    
    // Mock de la recherche d'utilisateur
    User.findById = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: 'user_id',
        username: 'testuser',
        role: 'admin'
      })
    }));
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('GET /api/bons', () => {
    it('devrait récupérer tous les bons de fabrication', async () => {
      // Mock de la réponse de la base de données
      const mockBons = [
        {
          _id: 'bon_id_1',
          numero: 'BF-2025-0001',
          date: new Date(),
          etat: 'en_cours',
          client: { _id: 'client_id_1', nom: 'Client Test 1' },
          machine: { _id: 'machine_id_1', nom: 'Machine Test 1' }
        },
        {
          _id: 'bon_id_2',
          numero: 'BF-2025-0002',
          date: new Date(),
          etat: 'termine',
          client: { _id: 'client_id_2', nom: 'Client Test 2' },
          machine: { _id: 'machine_id_2', nom: 'Machine Test 2' }
        }
      ];
      
      BonFabrication.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue(mockBons)
          }))
        }))
      }));
      
      const res = await request(app)
        .get('/api/bons')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].numero).toBe('BF-2025-0001');
      expect(res.body[1].numero).toBe('BF-2025-0002');
      expect(BonFabrication.find).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/bons/:id', () => {
    it('devrait récupérer un bon de fabrication par ID', async () => {
      // Mock de la réponse de la base de données
      const mockBon = {
        _id: 'bon_id_1',
        numero: 'BF-2025-0001',
        date: new Date(),
        etat: 'en_cours',
        client: { _id: 'client_id_1', nom: 'Client Test 1' },
        machine: { _id: 'machine_id_1', nom: 'Machine Test 1' }
      };
      
      BonFabrication.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                  populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(mockBon)
                  }))
                }))
              }))
            }))
          }))
        }))
      }));
      
      const res = await request(app)
        .get('/api/bons/bon_id_1')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.numero).toBe('BF-2025-0001');
      expect(BonFabrication.findById).toHaveBeenCalledWith('bon_id_1');
    });
    
    it('devrait retourner 404 si le bon n\'existe pas', async () => {
      BonFabrication.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                  populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(null)
                  }))
                }))
              }))
            }))
          }))
        }))
      }));
      
      const res = await request(app)
        .get('/api/bons/bon_inexistant')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Bon de fabrication non trouvé');
    });
  });
  
  describe('POST /api/bons', () => {
    it('devrait créer un nouveau bon de fabrication', async () => {
      // Mock des vérifications
      Client.findById = jest.fn().mockResolvedValue({ _id: 'client_id_1', nom: 'Client Test' });
      Machine.findById = jest.fn().mockResolvedValue({ _id: 'machine_id_1', nom: 'Machine Test' });
      
      // Mock de la création
      const mockBonCreated = {
        _id: 'bon_id_new',
        numero: 'BF-2025-0003',
        date: new Date(),
        etat: 'en_attente',
        client: 'client_id_1',
        travail: {
          designation: 'Test travail',
          quantite: 1000,
          format: 'A4',
          support: 'Papier couché',
          couleurs: ['Cyan', 'Magenta', 'Jaune', 'Noir'],
          finitions: ['Vernis']
        },
        machine: 'machine_id_1',
        personnel: ['user_id']
      };
      
      BonFabrication.create = jest.fn().mockResolvedValue(mockBonCreated);
      
      const bonData = {
        date: new Date(),
        etat: 'en_attente',
        client: 'client_id_1',
        travail: {
          designation: 'Test travail',
          quantite: 1000,
          format: 'A4',
          support: 'Papier couché',
          couleurs: ['Cyan', 'Magenta', 'Jaune', 'Noir'],
          finitions: ['Vernis']
        },
        machine: 'machine_id_1',
        personnel: ['user_id']
      };
      
      const res = await request(app)
        .post('/api/bons')
        .set('Authorization', token)
        .send(bonData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.numero).toBe('BF-2025-0003');
      expect(Client.findById).toHaveBeenCalledWith('client_id_1');
      expect(Machine.findById).toHaveBeenCalledWith('machine_id_1');
      expect(BonFabrication.create).toHaveBeenCalledWith(bonData);
    });
    
    it('devrait retourner 400 si le client n\'existe pas', async () => {
      Client.findById = jest.fn().mockResolvedValue(null);
      
      const bonData = {
        date: new Date(),
        etat: 'en_attente',
        client: 'client_inexistant',
        travail: {
          designation: 'Test travail',
          quantite: 1000,
          format: 'A4',
          support: 'Papier couché',
          couleurs: ['Cyan', 'Magenta', 'Jaune', 'Noir'],
          finitions: ['Vernis']
        },
        machine: 'machine_id_1',
        personnel: ['user_id']
      };
      
      const res = await request(app)
        .post('/api/bons')
        .set('Authorization', token)
        .send(bonData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Client non trouvé');
    });
  });
  
  describe('PUT /api/bons/:id', () => {
    it('devrait mettre à jour un bon de fabrication', async () => {
      // Mock du bon existant
      const mockBon = {
        _id: 'bon_id_1',
        numero: 'BF-2025-0001',
        date: new Date('2025-01-01'),
        etat: 'en_attente',
        client: 'client_id_1',
        travail: {
          designation: 'Ancien travail',
          quantite: 500,
          format: 'A4',
          support: 'Papier standard',
          couleurs: ['Noir'],
          finitions: []
        },
        machine: 'machine_id_1',
        personnel: ['user_id'],
        save: jest.fn()
      };
      
      BonFabrication.findById = jest.fn().mockResolvedValue(mockBon);
      mockBon.save = jest.fn().mockResolvedValue({
        ...mockBon,
        etat: 'en_cours',
        travail: {
          ...mockBon.travail,
          designation: 'Nouveau travail',
          quantite: 1000
        }
      });
      
      const updateData = {
        etat: 'en_cours',
        travail: {
          designation: 'Nouveau travail',
          quantite: 1000,
          format: 'A4',
          support: 'Papier standard',
          couleurs: ['Noir'],
          finitions: []
        }
      };
      
      const res = await request(app)
        .put('/api/bons/bon_id_1')
        .set('Authorization', token)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.etat).toBe('en_cours');
      expect(res.body.travail.designation).toBe('Nouveau travail');
      expect(res.body.travail.quantite).toBe(1000);
      expect(BonFabrication.findById).toHaveBeenCalledWith('bon_id_1');
      expect(mockBon.save).toHaveBeenCalled();
    });
    
    it('devrait retourner 404 si le bon n\'existe pas', async () => {
      BonFabrication.findById = jest.fn().mockResolvedValue(null);
      
      const updateData = {
        etat: 'en_cours'
      };
      
      const res = await request(app)
        .put('/api/bons/bon_inexistant')
        .set('Authorization', token)
        .send(updateData);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Bon de fabrication non trouvé');
    });
  });
  
  describe('DELETE /api/bons/:id', () => {
    it('devrait supprimer un bon de fabrication', async () => {
      // Mock du bon existant
      const mockBon = {
        _id: 'bon_id_1',
        numero: 'BF-2025-0001',
        remove: jest.fn().mockResolvedValue(undefined)
      };
      
      BonFabrication.findById = jest.fn().mockResolvedValue(mockBon);
      
      const res = await request(app)
        .delete('/api/bons/bon_id_1')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Bon de fabrication supprimé');
      expect(BonFabrication.findById).toHaveBeenCalledWith('bon_id_1');
      expect(mockBon.remove).toHaveBeenCalled();
    });
    
    it('devrait retourner 404 si le bon n\'existe pas', async () => {
      BonFabrication.findById = jest.fn().mockResolvedValue(null);
      
      const res = await request(app)
        .delete('/api/bons/bon_inexistant')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Bon de fabrication non trouvé');
    });
  });
  
  describe('PATCH /api/bons/:id/status', () => {
    it('devrait changer le statut d\'un bon de fabrication', async () => {
      // Mock du bon existant
      const mockBon = {
        _id: 'bon_id_1',
        numero: 'BF-2025-0001',
        etat: 'en_attente',
        save: jest.fn()
      };
      
      BonFabrication.findById = jest.fn().mockResolvedValue(mockBon);
      mockBon.save = jest.fn().mockResolvedValue({
        ...mockBon,
        etat: 'en_cours'
      });
      
      const statusData = {
        status: 'en_cours'
      };
      
      const res = await request(app)
        .patch('/api/bons/bon_id_1/status')
        .set('Authorization', token)
        .send(statusData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.etat).toBe('en_cours');
      expect(BonFabrication.findById).toHaveBeenCalledWith('bon_id_1');
      expect(mockBon.save).toHaveBeenCalled();
    });
    
    it('devrait retourner 400 si le statut est invalide', async () => {
      const statusData = {
        status: 'statut_invalide'
      };
      
      const res = await request(app)
        .patch('/api/bons/bon_id_1/status')
        .set('Authorization', token)
        .send(statusData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Statut invalide');
    });
  });
});

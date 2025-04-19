import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/server';
import User from '../src/models/User';
import ControleQualite from '../src/models/ControleQualite';
import BonFabrication from '../src/models/BonFabrication';

// Mock des modèles
jest.mock('../src/models/User');
jest.mock('../src/models/ControleQualite');
jest.mock('../src/models/BonFabrication');

describe('API Routes - Contrôle Qualité', () => {
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
        role: 'operator'
      })
    }));
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('POST /api/controles', () => {
    it('devrait ajouter un nouveau contrôle qualité', async () => {
      // Mock des vérifications
      BonFabrication.findById = jest.fn().mockResolvedValue({ _id: 'bon_id_1' });
      BonFabrication.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
      
      // Mock de la création
      const mockControle = {
        _id: 'controle_id_1',
        bonFabrication: 'bon_id_1',
        personnel: 'user_id',
        pointControle: 'Densité d\'encre',
        valeurMesuree: 1.8,
        valeurReference: 1.7,
        toleranceMin: 0.1,
        toleranceMax: 0.2,
        unite: 'D',
        conforme: true,
        dateControle: new Date(),
        commentaire: 'Test commentaire'
      };
      
      ControleQualite.create = jest.fn().mockResolvedValue(mockControle);
      
      const controleData = {
        bonFabrication: 'bon_id_1',
        pointControle: 'Densité d\'encre',
        valeurMesuree: 1.8,
        valeurReference: 1.7,
        toleranceMin: 0.1,
        toleranceMax: 0.2,
        unite: 'D',
        conforme: true,
        commentaire: 'Test commentaire'
      };
      
      const res = await request(app)
        .post('/api/controles')
        .set('Authorization', token)
        .send(controleData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body._id).toBe('controle_id_1');
      expect(res.body.pointControle).toBe('Densité d\'encre');
      expect(res.body.valeurMesuree).toBe(1.8);
      expect(BonFabrication.findById).toHaveBeenCalledWith('bon_id_1');
      expect(ControleQualite.create).toHaveBeenCalledWith({
        ...controleData,
        personnel: 'user_id',
        dateControle: expect.any(Date)
      });
      expect(BonFabrication.findByIdAndUpdate).toHaveBeenCalledWith(
        'bon_id_1',
        { $push: { controles: 'controle_id_1' } }
      );
    });
    
    it('devrait retourner 400 si le bon de fabrication n\'existe pas', async () => {
      BonFabrication.findById = jest.fn().mockResolvedValue(null);
      
      const controleData = {
        bonFabrication: 'bon_inexistant',
        pointControle: 'Densité d\'encre',
        valeurMesuree: 1.8,
        valeurReference: 1.7,
        toleranceMin: 0.1,
        toleranceMax: 0.2,
        unite: 'D',
        conforme: true
      };
      
      const res = await request(app)
        .post('/api/controles')
        .set('Authorization', token)
        .send(controleData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Bon de fabrication non trouvé');
    });
  });
  
  describe('GET /api/controles/bon/:id', () => {
    it('devrait récupérer tous les contrôles qualité d\'un bon de fabrication', async () => {
      // Mock de la réponse de la base de données
      const mockControles = [
        {
          _id: 'controle_id_1',
          bonFabrication: 'bon_id_1',
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          pointControle: 'Densité d\'encre',
          valeurMesuree: 1.8,
          valeurReference: 1.7,
          toleranceMin: 0.1,
          toleranceMax: 0.2,
          unite: 'D',
          conforme: true,
          dateControle: new Date(),
          commentaire: 'Test commentaire 1'
        },
        {
          _id: 'controle_id_2',
          bonFabrication: 'bon_id_1',
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          pointControle: 'Repérage',
          valeurMesuree: 0.05,
          valeurReference: 0.0,
          toleranceMin: 0.0,
          toleranceMax: 0.1,
          unite: 'mm',
          conforme: true,
          dateControle: new Date(),
          commentaire: 'Test commentaire 2'
        }
      ];
      
      ControleQualite.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          sort: jest.fn().mockResolvedValue(mockControles)
        }))
      }));
      
      const res = await request(app)
        .get('/api/controles/bon/bon_id_1')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].pointControle).toBe('Densité d\'encre');
      expect(res.body[1].pointControle).toBe('Repérage');
      expect(ControleQualite.find).toHaveBeenCalledWith({ bonFabrication: 'bon_id_1' });
    });
  });
  
  describe('GET /api/controles/:id', () => {
    it('devrait récupérer un contrôle qualité par ID', async () => {
      // Mock de la réponse de la base de données
      const mockControle = {
        _id: 'controle_id_1',
        bonFabrication: { _id: 'bon_id_1', numero: 'BF-2025-0001' },
        personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
        pointControle: 'Densité d\'encre',
        valeurMesuree: 1.8,
        valeurReference: 1.7,
        toleranceMin: 0.1,
        toleranceMax: 0.2,
        unite: 'D',
        conforme: true,
        dateControle: new Date(),
        commentaire: 'Test commentaire'
      };
      
      ControleQualite.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(mockControle)
        }))
      }));
      
      const res = await request(app)
        .get('/api/controles/controle_id_1')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe('controle_id_1');
      expect(res.body.pointControle).toBe('Densité d\'encre');
      expect(res.body.valeurMesuree).toBe(1.8);
      expect(ControleQualite.findById).toHaveBeenCalledWith('controle_id_1');
    });
    
    it('devrait retourner 404 si le contrôle n\'existe pas', async () => {
      ControleQualite.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(null)
        }))
      }));
      
      const res = await request(app)
        .get('/api/controles/controle_inexistant')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Contrôle qualité non trouvé');
    });
  });
  
  describe('PUT /api/controles/:id', () => {
    it('devrait mettre à jour un contrôle qualité', async () => {
      // Mock du contrôle existant
      const mockControle = {
        _id: 'controle_id_1',
        bonFabrication: 'bon_id_1',
        personnel: 'user_id',
        pointControle: 'Densité d\'encre',
        valeurMesuree: 1.8,
        valeurReference: 1.7,
        toleranceMin: 0.1,
        toleranceMax: 0.2,
        unite: 'D',
        conforme: true,
        dateControle: new Date(),
        commentaire: 'Ancien commentaire',
        save: jest.fn()
      };
      
      ControleQualite.findById = jest.fn().mockResolvedValue(mockControle);
      mockControle.save = jest.fn().mockResolvedValue({
        ...mockControle,
        valeurMesuree: 1.9,
        conforme: false,
        commentaire: 'Nouveau commentaire'
      });
      
      const updateData = {
        valeurMesuree: 1.9,
        conforme: false,
        commentaire: 'Nouveau commentaire'
      };
      
      const res = await request(app)
        .put('/api/controles/controle_id_1')
        .set('Authorization', token)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.valeurMesuree).toBe(1.9);
      expect(res.body.conforme).toBe(false);
      expect(res.body.commentaire).toBe('Nouveau commentaire');
      expect(ControleQualite.findById).toHaveBeenCalledWith('controle_id_1');
      expect(mockControle.save).toHaveBeenCalled();
    });
    
    it('devrait retourner 404 si le contrôle n\'existe pas', async () => {
      ControleQualite.findById = jest.fn().mockResolvedValue(null);
      
      const updateData = {
        valeurMesuree: 1.9
      };
      
      const res = await request(app)
        .put('/api/controles/controle_inexistant')
        .set('Authorization', token)
        .send(updateData);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Contrôle qualité non trouvé');
    });
  });
  
  describe('DELETE /api/controles/:id', () => {
    it('devrait supprimer un contrôle qualité', async () => {
      // Mock du contrôle existant
      const mockControle = {
        _id: 'controle_id_1',
        bonFabrication: 'bon_id_1',
        remove: jest.fn().mockResolvedValue(undefined)
      };
      
      ControleQualite.findById = jest.fn().mockResolvedValue(mockControle);
      BonFabrication.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
      
      const res = await request(app)
        .delete('/api/controles/controle_id_1')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Contrôle qualité supprimé');
      expect(ControleQualite.findById).toHaveBeenCalledWith('controle_id_1');
      expect(BonFabrication.findByIdAndUpdate).toHaveBeenCalledWith(
        'bon_id_1',
        { $pull: { controles: 'controle_id_1' } }
      );
      expect(mockControle.remove).toHaveBeenCalled();
    });
    
    it('devrait retourner 404 si le contrôle n\'existe pas', async () => {
      ControleQualite.findById = jest.fn().mockResolvedValue(null);
      
      const res = await request(app)
        .delete('/api/controles/controle_inexistant')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Contrôle qualité non trouvé');
    });
  });
  
  describe('GET /api/controles/stats/conformite', () => {
    it('devrait récupérer les statistiques de conformité', async () => {
      // Mock des contrôles
      const mockControles = [
        { conforme: true },
        { conforme: true },
        { conforme: false },
        { conforme: true },
        { conforme: true }
      ];
      
      ControleQualite.find = jest.fn().mockResolvedValue(mockControles);
      
      // Mock des statistiques par point de contrôle
      const mockPointsControle = [
        {
          _id: 'Densité d\'encre',
          pointControle: 'Densité d\'encre',
          total: 3,
          conformes: 2,
          tauxConformite: 66.67
        },
        {
          _id: 'Repérage',
          pointControle: 'Repérage',
          total: 2,
          conformes: 2,
          tauxConformite: 100
        }
      ];
      
      ControleQualite.aggregate = jest.fn().mockResolvedValue(mockPointsControle);
      
      const res = await request(app)
        .get('/api/controles/stats/conformite')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(5);
      expect(res.body.conformes).toBe(4);
      expect(res.body.nonConformes).toBe(1);
      expect(res.body.tauxConformite).toBe(80);
      expect(res.body.pointsControle).toHaveLength(2);
      expect(res.body.pointsControle[0].pointControle).toBe('Densité d\'encre');
      expect(res.body.pointsControle[1].pointControle).toBe('Repérage');
      expect(ControleQualite.find).toHaveBeenCalled();
      expect(ControleQualite.aggregate).toHaveBeenCalled();
    });
    
    it('devrait filtrer les résultats par date', async () => {
      // Mock des contrôles
      const mockControles = [
        { conforme: true },
        { conforme: true },
        { conforme: true }
      ];
      
      ControleQualite.find = jest.fn().mockResolvedValue(mockControles);
      
      // Mock des statistiques par point de contrôle
      const mockPointsControle = [
        {
          _id: 'Densité d\'encre',
          pointControle: 'Densité d\'encre',
          total: 2,
          conformes: 2,
          tauxConformite: 100
        },
        {
          _id: 'Repérage',
          pointControle: 'Repérage',
          total: 1,
          conformes: 1,
          tauxConformite: 100
        }
      ];
      
      ControleQualite.aggregate = jest.fn().mockResolvedValue(mockPointsControle);
      
      const dateDebut = '2025-01-01';
      const dateFin = '2025-01-31';
      
      const res = await request(app)
        .get(`/api/controles/stats/conformite?dateDebut=${dateDebut}&dateFin=${dateFin}`)
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(3);
      expect(res.body.conformes).toBe(3);
      expect(res.body.tauxConformite).toBe(100);
      expect(ControleQualite.find).toHaveBeenCalled();
      expect(ControleQualite.aggregate).toHaveBeenCalled();
    });
  });
});

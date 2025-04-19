import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/server';
import User from '../src/models/User';
import ParametreTechnique from '../src/models/ParametreTechnique';
import BonFabrication from '../src/models/BonFabrication';
import Machine from '../src/models/Machine';

// Mock des modèles
jest.mock('../src/models/User');
jest.mock('../src/models/ParametreTechnique');
jest.mock('../src/models/BonFabrication');
jest.mock('../src/models/Machine');

describe('API Routes - Paramètres Techniques', () => {
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
  
  describe('POST /api/parametres', () => {
    it('devrait ajouter un nouveau paramètre technique', async () => {
      // Mock des vérifications
      BonFabrication.findById = jest.fn().mockResolvedValue({ _id: 'bon_id_1' });
      Machine.findById = jest.fn().mockResolvedValue({ _id: 'machine_id_1' });
      BonFabrication.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
      
      // Mock de la création
      const mockParametre = {
        _id: 'parametre_id_1',
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        personnel: 'user_id',
        type: 'Pression',
        valeur: 5.2,
        unite: 'bar',
        dateReleve: new Date(),
        commentaire: 'Test commentaire'
      };
      
      ParametreTechnique.create = jest.fn().mockResolvedValue(mockParametre);
      
      const parametreData = {
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        type: 'Pression',
        valeur: 5.2,
        unite: 'bar',
        commentaire: 'Test commentaire'
      };
      
      const res = await request(app)
        .post('/api/parametres')
        .set('Authorization', token)
        .send(parametreData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body._id).toBe('parametre_id_1');
      expect(res.body.type).toBe('Pression');
      expect(res.body.valeur).toBe(5.2);
      expect(BonFabrication.findById).toHaveBeenCalledWith('bon_id_1');
      expect(Machine.findById).toHaveBeenCalledWith('machine_id_1');
      expect(ParametreTechnique.create).toHaveBeenCalledWith({
        ...parametreData,
        personnel: 'user_id',
        dateReleve: expect.any(Date)
      });
      expect(BonFabrication.findByIdAndUpdate).toHaveBeenCalledWith(
        'bon_id_1',
        { $push: { parametres: 'parametre_id_1' } }
      );
    });
    
    it('devrait retourner 400 si le bon de fabrication n\'existe pas', async () => {
      BonFabrication.findById = jest.fn().mockResolvedValue(null);
      
      const parametreData = {
        bonFabrication: 'bon_inexistant',
        machine: 'machine_id_1',
        type: 'Pression',
        valeur: 5.2,
        unite: 'bar'
      };
      
      const res = await request(app)
        .post('/api/parametres')
        .set('Authorization', token)
        .send(parametreData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Bon de fabrication non trouvé');
    });
  });
  
  describe('GET /api/parametres/bon/:id', () => {
    it('devrait récupérer tous les paramètres techniques d\'un bon de fabrication', async () => {
      // Mock de la réponse de la base de données
      const mockParametres = [
        {
          _id: 'parametre_id_1',
          bonFabrication: 'bon_id_1',
          machine: 'machine_id_1',
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          type: 'Pression',
          valeur: 5.2,
          unite: 'bar',
          dateReleve: new Date(),
          commentaire: 'Test commentaire 1'
        },
        {
          _id: 'parametre_id_2',
          bonFabrication: 'bon_id_1',
          machine: 'machine_id_1',
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          type: 'Température',
          valeur: 180,
          unite: '°C',
          dateReleve: new Date(),
          commentaire: 'Test commentaire 2'
        }
      ];
      
      ParametreTechnique.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          sort: jest.fn().mockResolvedValue(mockParametres)
        }))
      }));
      
      const res = await request(app)
        .get('/api/parametres/bon/bon_id_1')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].type).toBe('Pression');
      expect(res.body[1].type).toBe('Température');
      expect(ParametreTechnique.find).toHaveBeenCalledWith({ bonFabrication: 'bon_id_1' });
    });
  });
  
  describe('GET /api/parametres/:id', () => {
    it('devrait récupérer un paramètre technique par ID', async () => {
      // Mock de la réponse de la base de données
      const mockParametre = {
        _id: 'parametre_id_1',
        bonFabrication: { _id: 'bon_id_1', numero: 'BF-2025-0001' },
        machine: { _id: 'machine_id_1', nom: 'Machine Test' },
        personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
        type: 'Pression',
        valeur: 5.2,
        unite: 'bar',
        dateReleve: new Date(),
        commentaire: 'Test commentaire'
      };
      
      ParametreTechnique.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockResolvedValue(mockParametre)
          }))
        }))
      }));
      
      const res = await request(app)
        .get('/api/parametres/parametre_id_1')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe('parametre_id_1');
      expect(res.body.type).toBe('Pression');
      expect(res.body.valeur).toBe(5.2);
      expect(ParametreTechnique.findById).toHaveBeenCalledWith('parametre_id_1');
    });
    
    it('devrait retourner 404 si le paramètre n\'existe pas', async () => {
      ParametreTechnique.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockResolvedValue(null)
          }))
        }))
      }));
      
      const res = await request(app)
        .get('/api/parametres/parametre_inexistant')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Paramètre technique non trouvé');
    });
  });
  
  describe('PUT /api/parametres/:id', () => {
    it('devrait mettre à jour un paramètre technique', async () => {
      // Mock du paramètre existant
      const mockParametre = {
        _id: 'parametre_id_1',
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        personnel: 'user_id',
        type: 'Pression',
        valeur: 5.2,
        unite: 'bar',
        dateReleve: new Date(),
        commentaire: 'Ancien commentaire',
        save: jest.fn()
      };
      
      ParametreTechnique.findById = jest.fn().mockResolvedValue(mockParametre);
      mockParametre.save = jest.fn().mockResolvedValue({
        ...mockParametre,
        valeur: 5.5,
        commentaire: 'Nouveau commentaire'
      });
      
      const updateData = {
        valeur: 5.5,
        commentaire: 'Nouveau commentaire'
      };
      
      const res = await request(app)
        .put('/api/parametres/parametre_id_1')
        .set('Authorization', token)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.valeur).toBe(5.5);
      expect(res.body.commentaire).toBe('Nouveau commentaire');
      expect(ParametreTechnique.findById).toHaveBeenCalledWith('parametre_id_1');
      expect(mockParametre.save).toHaveBeenCalled();
    });
    
    it('devrait retourner 404 si le paramètre n\'existe pas', async () => {
      ParametreTechnique.findById = jest.fn().mockResolvedValue(null);
      
      const updateData = {
        valeur: 5.5
      };
      
      const res = await request(app)
        .put('/api/parametres/parametre_inexistant')
        .set('Authorization', token)
        .send(updateData);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Paramètre technique non trouvé');
    });
  });
  
  describe('DELETE /api/parametres/:id', () => {
    it('devrait supprimer un paramètre technique', async () => {
      // Mock du paramètre existant
      const mockParametre = {
        _id: 'parametre_id_1',
        bonFabrication: 'bon_id_1',
        remove: jest.fn().mockResolvedValue(undefined)
      };
      
      ParametreTechnique.findById = jest.fn().mockResolvedValue(mockParametre);
      BonFabrication.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
      
      const res = await request(app)
        .delete('/api/parametres/parametre_id_1')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Paramètre technique supprimé');
      expect(ParametreTechnique.findById).toHaveBeenCalledWith('parametre_id_1');
      expect(BonFabrication.findByIdAndUpdate).toHaveBeenCalledWith(
        'bon_id_1',
        { $pull: { parametres: 'parametre_id_1' } }
      );
      expect(mockParametre.remove).toHaveBeenCalled();
    });
    
    it('devrait retourner 404 si le paramètre n\'existe pas', async () => {
      ParametreTechnique.findById = jest.fn().mockResolvedValue(null);
      
      const res = await request(app)
        .delete('/api/parametres/parametre_inexistant')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Paramètre technique non trouvé');
    });
  });
  
  describe('GET /api/parametres/stats/machine/:id', () => {
    it('devrait récupérer les statistiques des paramètres techniques par machine', async () => {
      // Mock de la vérification de la machine
      Machine.findById = jest.fn().mockResolvedValue({ _id: 'machine_id_1', nom: 'Machine Test' });
      
      // Mock des types de paramètres
      ParametreTechnique.distinct = jest.fn().mockResolvedValue(['Pression', 'Température']);
      
      // Mock des paramètres pour chaque type
      const mockParametresPression = [
        {
          _id: 'parametre_id_1',
          type: 'Pression',
          valeur: 5.2,
          unite: 'bar',
          dateReleve: new Date()
        },
        {
          _id: 'parametre_id_2',
          type: 'Pression',
          valeur: 5.5,
          unite: 'bar',
          dateReleve: new Date()
        }
      ];
      
      const mockParametresTemperature = [
        {
          _id: 'parametre_id_3',
          type: 'Température',
          valeur: 180,
          unite: '°C',
          dateReleve: new Date()
        },
        {
          _id: 'parametre_id_4',
          type: 'Température',
          valeur: 185,
          unite: '°C',
          dateReleve: new Date()
        }
      ];
      
      ParametreTechnique.find = jest.fn()
        .mockImplementationOnce(() => ({
          sort: jest.fn().mockResolvedValue(mockParametresPression)
        }))
        .mockImplementationOnce(() => ({
          sort: jest.fn().mockResolvedValue(mockParametresTemperature)
        }));
      
      const res = await request(app)
        .get('/api/parametres/stats/machine/machine_id_1')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].type).toBe('Pression');
      expect(res.body[0].moyenne).toBe(5.35); // (5.2 + 5.5) / 2
      expect(res.body[1].type).toBe('Température');
      expect(res.body[1].moyenne).toBe(182.5); // (180 + 185) / 2
      expect(Machine.findById).toHaveBeenCalledWith('machine_id_1');
      expect(ParametreTechnique.distinct).toHaveBeenCalledWith('type', { machine: 'machine_id_1' });
    });
    
    it('devrait retourner 400 si la machine n\'existe pas', async () => {
      Machine.findById = jest.fn().mockResolvedValue(null);
      
      const res = await request(app)
        .get('/api/parametres/stats/machine/machine_inexistante')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Machine non trouvée');
    });
  });
});

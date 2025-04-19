import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/server';
import User from '../src/models/User';
import Incident from '../src/models/Incident';
import BonFabrication from '../src/models/BonFabrication';
import Machine from '../src/models/Machine';

// Mock des modèles
jest.mock('../src/models/User');
jest.mock('../src/models/Incident');
jest.mock('../src/models/BonFabrication');
jest.mock('../src/models/Machine');

describe('API Routes - Incidents', () => {
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
        role: 'supervisor'
      })
    }));
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('POST /api/incidents', () => {
    it('devrait ajouter un nouvel incident', async () => {
      // Mock des vérifications
      BonFabrication.findById = jest.fn().mockResolvedValue({ _id: 'bon_id_1' });
      Machine.findById = jest.fn().mockResolvedValue({ _id: 'machine_id_1' });
      BonFabrication.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
      
      // Mock de la création
      const mockIncident = {
        _id: 'incident_id_1',
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        personnel: 'user_id',
        type: 'Mécanique',
        description: 'Problème de cylindre',
        gravite: 'moyenne',
        dateDebut: new Date(),
        actionCorrective: 'Remplacement du cylindre',
        statut: 'ouvert',
        impactProduction: 'Arrêt partiel'
      };
      
      Incident.create = jest.fn().mockResolvedValue(mockIncident);
      
      const incidentData = {
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        type: 'Mécanique',
        description: 'Problème de cylindre',
        gravite: 'moyenne',
        actionCorrective: 'Remplacement du cylindre',
        impactProduction: 'Arrêt partiel'
      };
      
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', token)
        .send(incidentData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body._id).toBe('incident_id_1');
      expect(res.body.type).toBe('Mécanique');
      expect(res.body.gravite).toBe('moyenne');
      expect(BonFabrication.findById).toHaveBeenCalledWith('bon_id_1');
      expect(Machine.findById).toHaveBeenCalledWith('machine_id_1');
      expect(Incident.create).toHaveBeenCalledWith({
        ...incidentData,
        personnel: 'user_id',
        dateDebut: expect.any(Date),
        statut: 'ouvert'
      });
      expect(BonFabrication.findByIdAndUpdate).toHaveBeenCalledWith(
        'bon_id_1',
        { $push: { incidents: 'incident_id_1' } }
      );
    });
    
    it('devrait mettre la machine en maintenance si l\'incident est critique', async () => {
      // Mock des vérifications
      BonFabrication.findById = jest.fn().mockResolvedValue({ _id: 'bon_id_1' });
      Machine.findById = jest.fn().mockResolvedValue({ _id: 'machine_id_1' });
      BonFabrication.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
      Machine.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
      
      // Mock de la création
      const mockIncident = {
        _id: 'incident_id_1',
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        personnel: 'user_id',
        type: 'Mécanique',
        description: 'Panne majeure',
        gravite: 'critique',
        dateDebut: new Date(),
        statut: 'ouvert'
      };
      
      Incident.create = jest.fn().mockResolvedValue(mockIncident);
      
      const incidentData = {
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        type: 'Mécanique',
        description: 'Panne majeure',
        gravite: 'critique'
      };
      
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', token)
        .send(incidentData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.gravite).toBe('critique');
      expect(Machine.findByIdAndUpdate).toHaveBeenCalledWith(
        'machine_id_1',
        { statut: 'en_maintenance' }
      );
    });
  });
  
  describe('GET /api/incidents', () => {
    it('devrait récupérer tous les incidents', async () => {
      // Mock de la réponse de la base de données
      const mockIncidents = [
        {
          _id: 'incident_id_1',
          bonFabrication: { _id: 'bon_id_1', numero: 'BF-2025-0001' },
          machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          type: 'Mécanique',
          description: 'Problème de cylindre',
          gravite: 'moyenne',
          dateDebut: new Date(),
          statut: 'ouvert'
        },
        {
          _id: 'incident_id_2',
          bonFabrication: { _id: 'bon_id_2', numero: 'BF-2025-0002' },
          machine: { _id: 'machine_id_2', nom: 'Machine Test 2', type: 'heliogravure' },
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          type: 'Électrique',
          description: 'Court-circuit',
          gravite: 'elevee',
          dateDebut: new Date(),
          statut: 'en_cours'
        }
      ];
      
      Incident.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockImplementation(() => ({
              sort: jest.fn().mockResolvedValue(mockIncidents)
            }))
          }))
        }))
      }));
      
      const res = await request(app)
        .get('/api/incidents')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].type).toBe('Mécanique');
      expect(res.body[1].type).toBe('Électrique');
      expect(Incident.find).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/incidents/bon/:id', () => {
    it('devrait récupérer tous les incidents d\'un bon de fabrication', async () => {
      // Mock de la réponse de la base de données
      const mockIncidents = [
        {
          _id: 'incident_id_1',
          bonFabrication: 'bon_id_1',
          machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          type: 'Mécanique',
          description: 'Problème de cylindre',
          gravite: 'moyenne',
          dateDebut: new Date(),
          statut: 'ouvert'
        },
        {
          _id: 'incident_id_2',
          bonFabrication: 'bon_id_1',
          machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          type: 'Électrique',
          description: 'Court-circuit',
          gravite: 'elevee',
          dateDebut: new Date(),
          statut: 'en_cours'
        }
      ];
      
      Incident.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue(mockIncidents)
          }))
        }))
      }));
      
      const res = await request(app)
        .get('/api/incidents/bon/bon_id_1')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].type).toBe('Mécanique');
      expect(res.body[1].type).toBe('Électrique');
      expect(Incident.find).toHaveBeenCalledWith({ bonFabrication: 'bon_id_1' });
    });
  });
  
  describe('PUT /api/incidents/:id', () => {
    it('devrait mettre à jour un incident', async () => {
      // Mock de l'incident existant
      const mockIncident = {
        _id: 'incident_id_1',
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        personnel: 'user_id',
        type: 'Mécanique',
        description: 'Problème de cylindre',
        gravite: 'moyenne',
        dateDebut: new Date(),
        actionCorrective: '',
        statut: 'ouvert',
        impactProduction: 'Arrêt partiel',
        save: jest.fn()
      };
      
      Incident.findById = jest.fn().mockResolvedValue(mockIncident);
      mockIncident.save = jest.fn().mockResolvedValue({
        ...mockIncident,
        actionCorrective: 'Remplacement du cylindre',
        statut: 'en_cours'
      });
      
      const updateData = {
        actionCorrective: 'Remplacement du cylindre',
        statut: 'en_cours'
      };
      
      const res = await request(app)
        .put('/api/incidents/incident_id_1')
        .set('Authorization', token)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.actionCorrective).toBe('Remplacement du cylindre');
      expect(res.body.statut).toBe('en_cours');
      expect(Incident.findById).toHaveBeenCalledWith('incident_id_1');
      expect(mockIncident.save).toHaveBeenCalled();
    });
    
    it('devrait ajouter la date de fin si l\'incident est résolu', async () => {
      // Mock de l'incident existant
      const mockIncident = {
        _id: 'incident_id_1',
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        personnel: 'user_id',
        type: 'Mécanique',
        description: 'Problème de cylindre',
        gravite: 'moyenne',
        dateDebut: new Date(),
        dateFin: undefined,
        actionCorrective: 'Remplacement du cylindre',
        statut: 'en_cours',
        save: jest.fn()
      };
      
      Incident.findById = jest.fn().mockResolvedValue(mockIncident);
      mockIncident.save = jest.fn().mockImplementation(() => {
        mockIncident.dateFin = new Date();
        mockIncident.statut = 'resolu';
        return Promise.resolve(mockIncident);
      });
      
      const updateData = {
        statut: 'resolu'
      };
      
      const res = await request(app)
        .put('/api/incidents/incident_id_1')
        .set('Authorization', token)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.statut).toBe('resolu');
      expect(res.body.dateFin).toBeDefined();
      expect(Incident.findById).toHaveBeenCalledWith('incident_id_1');
      expect(mockIncident.save).toHaveBeenCalled();
    });
    
    it('devrait remettre la machine en disponible si l\'incident critique est résolu', async () => {
      // Mock de l'incident existant
      const mockIncident = {
        _id: 'incident_id_1',
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        personnel: 'user_id',
        type: 'Mécanique',
        description: 'Panne majeure',
        gravite: 'critique',
        dateDebut: new Date(),
        dateFin: undefined,
        statut: 'en_cours',
        save: jest.fn()
      };
      
      Incident.findById = jest.fn().mockResolvedValue(mockIncident);
      mockIncident.save = jest.fn().mockImplementation(() => {
        mockIncident.dateFin = new Date();
        mockIncident.statut = 'resolu';
        return Promise.resolve(mockIncident);
      });
      Machine.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
      
      const updateData = {
        statut: 'resolu'
      };
      
      const res = await request(app)
        .put('/api/incidents/incident_id_1')
        .set('Authorization', token)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.statut).toBe('resolu');
      expect(Machine.findByIdAndUpdate).toHaveBeenCalledWith(
        'machine_id_1',
        { statut: 'disponible' }
      );
    });
  });
  
  describe('GET /api/incidents/stats', () => {
    it('devrait récupérer les statistiques des incidents', async () => {
      // Mock des incidents
      const mockIncidents = [
        { statut: 'ouvert', gravite: 'faible', dateDebut: new Date(), dateFin: null },
        { statut: 'en_cours', gravite: 'moyenne', dateDebut: new Date(), dateFin: null },
        { statut: 'resolu', gravite: 'elevee', dateDebut: new Date(), dateFin: new Date() },
        { statut: 'resolu', gravite: 'critique', dateDebut: new Date(), dateFin: new Date() },
        { statut: 'ouvert', gravite: 'moyenne', dateDebut: new Date(), dateFin: null }
      ];
      
      Incident.find = jest.fn().mockResolvedValue(mockIncidents);
      
      // Mock des statistiques par type
      const mockTypesIncidents = [
        { _id: 'Mécanique', count: 3 },
        { _id: 'Électrique', count: 2 }
      ];
      
      Incident.aggregate = jest.fn().mockResolvedValue(mockTypesIncidents);
      
      const res = await request(app)
        .get('/api/incidents/stats')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(5);
      expect(res.body.ouverts).toBe(2);
      expect(res.body.enCours).toBe(1);
      expect(res.body.resolus).toBe(2);
      expect(res.body.parGravite.faible).toBe(1);
      expect(res.body.parGravite.moyenne).toBe(2);
      expect(res.body.parGravite.elevee).toBe(1);
      expect(res.body.parGravite.critique).toBe(1);
      expect(res.body.typesIncidents).toHaveLength(2);
      expect(res.body.typesIncidents[0]._id).toBe('Mécanique');
      expect(res.body.typesIncidents[1]._id).toBe('Électrique');
      expect(Incident.find).toHaveBeenCalled();
      expect(Incident.aggregate).toHaveBeenCalled();
    });
    
    it('devrait filtrer les résultats par date', async () => {
      // Mock des incidents
      const mockIncidents = [
        { statut: 'ouvert', gravite: 'faible', dateDebut: new Date(), dateFin: null },
        { statut: 'en_cours', gravite: 'moyenne', dateDebut: new Date(), dateFin: null },
        { statut: 'resolu', gravite: 'elevee', dateDebut: new Date(), dateFin: new Date() }
      ];
      
      Incident.find = jest.fn().mockResolvedValue(mockIncidents);
      
      // Mock des statistiques par type
      const mockTypesIncidents = [
        { _id: 'Mécanique', count: 2 },
        { _id: 'Électrique', count: 1 }
      ];
      
      Incident.aggregate = jest.fn().mockResolvedValue(mockTypesIncidents);
      
      const dateDebut = '2025-01-01';
      const dateFin = '2025-01-31';
      
      const res = await request(app)
        .get(`/api/incidents/stats?dateDebut=${dateDebut}&dateFin=${dateFin}`)
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(3);
      expect(Incident.find).toHaveBeenCalled();
      expect(Incident.aggregate).toHaveBeenCalled();
    });
  });
});

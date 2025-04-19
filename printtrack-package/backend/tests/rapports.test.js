import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/server';
import User from '../src/models/User';
import BonFabrication from '../src/models/BonFabrication';
import ParametreTechnique from '../src/models/ParametreTechnique';
import ControleQualite from '../src/models/ControleQualite';
import Incident from '../src/models/Incident';
import Machine from '../src/models/Machine';

// Mock des modèles
jest.mock('../src/models/User');
jest.mock('../src/models/BonFabrication');
jest.mock('../src/models/ParametreTechnique');
jest.mock('../src/models/ControleQualite');
jest.mock('../src/models/Incident');
jest.mock('../src/models/Machine');

describe('API Routes - Rapports', () => {
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
  
  describe('GET /api/rapports/production', () => {
    it('devrait générer un rapport de production', async () => {
      // Mock des bons de fabrication
      const mockBons = [
        {
          _id: 'bon_id_1',
          numero: 'BF-2025-0001',
          date: new Date('2025-01-01'),
          etat: 'termine',
          client: { _id: 'client_id_1', nom: 'Client Test 1' },
          machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
          travail: { designation: 'Travail 1', quantite: 1000 }
        },
        {
          _id: 'bon_id_2',
          numero: 'BF-2025-0002',
          date: new Date('2025-01-02'),
          etat: 'en_cours',
          client: { _id: 'client_id_2', nom: 'Client Test 2' },
          machine: { _id: 'machine_id_2', nom: 'Machine Test 2', type: 'heliogravure' },
          travail: { designation: 'Travail 2', quantite: 2000 }
        },
        {
          _id: 'bon_id_3',
          numero: 'BF-2025-0003',
          date: new Date('2025-01-03'),
          etat: 'en_attente',
          client: { _id: 'client_id_1', nom: 'Client Test 1' },
          machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
          travail: { designation: 'Travail 3', quantite: 3000 }
        }
      ];
      
      BonFabrication.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue(mockBons)
          }))
        }))
      }));
      
      // Mock des statistiques par machine
      const mockStatsMachines = [
        {
          _id: 'machine_id_1',
          nom: 'Machine Test 1',
          type: 'offset',
          count: 2,
          termines: 1
        },
        {
          _id: 'machine_id_2',
          nom: 'Machine Test 2',
          type: 'heliogravure',
          count: 1,
          termines: 0
        }
      ];
      
      // Mock des statistiques par client
      const mockStatsClients = [
        {
          _id: 'client_id_1',
          nom: 'Client Test 1',
          count: 2,
          termines: 1
        },
        {
          _id: 'client_id_2',
          nom: 'Client Test 2',
          count: 1,
          termines: 0
        }
      ];
      
      // Mock des incidents par gravité
      const mockIncidentsParGravite = [
        { _id: 'faible', count: 1 },
        { _id: 'moyenne', count: 2 },
        { _id: 'elevee', count: 1 },
        { _id: 'critique', count: 0 }
      ];
      
      // Mock des contrôles qualité
      const mockControles = [
        { conforme: true },
        { conforme: true },
        { conforme: false },
        { conforme: true }
      ];
      
      BonFabrication.aggregate = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(mockStatsMachines))
        .mockImplementationOnce(() => Promise.resolve(mockStatsClients));
      
      Incident.aggregate = jest.fn().mockResolvedValue(mockIncidentsParGravite);
      
      ControleQualite.find = jest.fn().mockResolvedValue(mockControles);
      
      const res = await request(app)
        .get('/api/rapports/production')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.statistiquesGenerales.total).toBe(3);
      expect(res.body.statistiquesGenerales.enAttente).toBe(1);
      expect(res.body.statistiquesGenerales.enCours).toBe(1);
      expect(res.body.statistiquesGenerales.termines).toBe(1);
      expect(res.body.statsMachines).toHaveLength(2);
      expect(res.body.statsClients).toHaveLength(2);
      expect(res.body.qualite.totalControles).toBe(4);
      expect(res.body.qualite.conformes).toBe(3);
      expect(res.body.qualite.tauxConformite).toBe(75);
      expect(res.body.bons).toHaveLength(3);
      expect(BonFabrication.find).toHaveBeenCalled();
      expect(BonFabrication.aggregate).toHaveBeenCalledTimes(2);
      expect(Incident.aggregate).toHaveBeenCalled();
      expect(ControleQualite.find).toHaveBeenCalled();
    });
    
    it('devrait filtrer les résultats par date, machine et client', async () => {
      // Mock des bons de fabrication filtrés
      const mockBons = [
        {
          _id: 'bon_id_1',
          numero: 'BF-2025-0001',
          date: new Date('2025-01-01'),
          etat: 'termine',
          client: { _id: 'client_id_1', nom: 'Client Test 1' },
          machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
          travail: { designation: 'Travail 1', quantite: 1000 }
        }
      ];
      
      BonFabrication.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue(mockBons)
          }))
        }))
      }));
      
      // Mock des statistiques par machine
      const mockStatsMachines = [
        {
          _id: 'machine_id_1',
          nom: 'Machine Test 1',
          type: 'offset',
          count: 1,
          termines: 1
        }
      ];
      
      // Mock des statistiques par client
      const mockStatsClients = [
        {
          _id: 'client_id_1',
          nom: 'Client Test 1',
          count: 1,
          termines: 1
        }
      ];
      
      // Mock des incidents par gravité
      const mockIncidentsParGravite = [
        { _id: 'faible', count: 0 },
        { _id: 'moyenne', count: 1 }
      ];
      
      // Mock des contrôles qualité
      const mockControles = [
        { conforme: true },
        { conforme: true }
      ];
      
      BonFabrication.aggregate = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(mockStatsMachines))
        .mockImplementationOnce(() => Promise.resolve(mockStatsClients));
      
      Incident.aggregate = jest.fn().mockResolvedValue(mockIncidentsParGravite);
      
      ControleQualite.find = jest.fn().mockResolvedValue(mockControles);
      
      const dateDebut = '2025-01-01';
      const dateFin = '2025-01-01';
      const machine = 'machine_id_1';
      const client = 'client_id_1';
      
      const res = await request(app)
        .get(`/api/rapports/production?dateDebut=${dateDebut}&dateFin=${dateFin}&machine=${machine}&client=${client}`)
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.statistiquesGenerales.total).toBe(1);
      expect(res.body.statistiquesGenerales.termines).toBe(1);
      expect(res.body.statsMachines).toHaveLength(1);
      expect(res.body.statsClients).toHaveLength(1);
      expect(res.body.qualite.totalControles).toBe(2);
      expect(res.body.qualite.conformes).toBe(2);
      expect(res.body.qualite.tauxConformite).toBe(100);
      expect(res.body.bons).toHaveLength(1);
      expect(BonFabrication.find).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/rapports/qualite', () => {
    it('devrait générer un rapport de qualité', async () => {
      // Mock des contrôles qualité
      const mockControles = [
        {
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
          dateControle: new Date('2025-01-01')
        },
        {
          _id: 'controle_id_2',
          bonFabrication: { _id: 'bon_id_2', numero: 'BF-2025-0002' },
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          pointControle: 'Repérage',
          valeurMesuree: 0.05,
          valeurReference: 0.0,
          toleranceMin: 0.0,
          toleranceMax: 0.1,
          unite: 'mm',
          conforme: true,
          dateControle: new Date('2025-01-02')
        },
        {
          _id: 'controle_id_3',
          bonFabrication: { _id: 'bon_id_1', numero: 'BF-2025-0001' },
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          pointControle: 'Densité d\'encre',
          valeurMesuree: 1.5,
          valeurReference: 1.7,
          toleranceMin: 0.1,
          toleranceMax: 0.2,
          unite: 'D',
          conforme: false,
          dateControle: new Date('2025-01-03')
        }
      ];
      
      ControleQualite.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue(mockControles)
          }))
        }))
      }));
      
      // Mock des points de contrôle problématiques
      const mockPointsControle = [
        {
          _id: 'Densité d\'encre',
          pointControle: 'Densité d\'encre',
          total: 2,
          conformes: 1,
          nonConformes: 1,
          tauxConformite: 50
        },
        {
          _id: 'Repérage',
          pointControle: 'Repérage',
          total: 1,
          conformes: 1,
          nonConformes: 0,
          tauxConformite: 100
        }
      ];
      
      // Mock de l'évolution dans le temps
      const mockEvolution = [
        {
          _id: '2025-01-01',
          date: '2025-01-01',
          total: 1,
          conformes: 1,
          tauxConformite: 100
        },
        {
          _id: '2025-01-02',
          date: '2025-01-02',
          total: 1,
          conformes: 1,
          tauxConformite: 100
        },
        {
          _id: '2025-01-03',
          date: '2025-01-03',
          total: 1,
          conformes: 0,
          tauxConformite: 0
        }
      ];
      
      ControleQualite.aggregate = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(mockPointsControle))
        .mockImplementationOnce(() => Promise.resolve(mockEvolution));
      
      const res = await request(app)
        .get('/api/rapports/qualite')
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.statistiquesGenerales.total).toBe(3);
      expect(res.body.statistiquesGenerales.conformes).toBe(2);
      expect(res.body.statistiquesGenerales.nonConformes).toBe(1);
      expect(res.body.statistiquesGenerales.tauxConformite).toBe(66.66666666666666);
      expect(res.body.pointsControle).toHaveLength(2);
      expect(res.body.evolution).toHaveLength(3);
      expect(res.body.controles).toHaveLength(3);
      expect(ControleQualite.find).toHaveBeenCalled();
      expect(ControleQualite.aggregate).toHaveBeenCalledTimes(2);
    });
    
    it('devrait filtrer les résultats par date et machine', async () => {
      // Mock pour la recherche de contrôles avec machine spécifique
      const mockControlesAggregate = [
        {
          _id: 'controle_id_1',
          pointControle: 'Densité d\'encre',
          valeurMesuree: 1.8,
          valeurReference: 1.7,
          toleranceMin: 0.1,
          toleranceMax: 0.2,
          unite: 'D',
          conforme: true,
          dateControle: new Date('2025-01-01'),
          bonFabrication: 'bon_id_1',
          'bonInfo.numero': 'BF-2025-0001',
          'personnelInfo.firstName': 'Test',
          'personnelInfo.lastName': 'User'
        }
      ];
      
      ControleQualite.aggregate = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(mockControlesAggregate))
        .mockImplementationOnce(() => Promise.resolve([
          {
            _id: 'Densité d\'encre',
            pointControle: 'Densité d\'encre',
            total: 1,
            conformes: 1,
            nonConformes: 0,
            tauxConformite: 100
          }
        ]))
        .mockImplementationOnce(() => Promise.resolve([
          {
            _id: '2025-01-01',
            date: '2025-01-01',
            total: 1,
            conformes: 1,
            tauxConformite: 100
          }
        ]));
      
      // Mock de la vérification de la machine
      Machine.findById = jest.fn().mockResolvedValue({ _id: 'machine_id_1', nom: 'Machine Test 1' });
      
      const dateDebut = '2025-01-01';
      const dateFin = '2025-01-01';
      const machine = 'machine_id_1';
      
      const res = await request(app)
        .get(`/api/rapports/qualite?dateDebut=${dateDebut}&dateFin=${dateFin}&machine=${machine}`)
        .set('Authorization', token);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.statistiquesGenerales.total).toBe(1);
      expect(res.body.statistiquesGenerales.conformes).toBe(1);
      expect(res.body.statistiquesGenerales.tauxConformite).toBe(100);
      expect(res.body.pointsControle).toHaveLength(1);
      expect(res.body.evolution).toHaveLength(1);
      expect(res.body.controles).toHaveLength(1);
      expect(ControleQualite.aggregate).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('GET /api/rapports/incidents', () => {
    it('devrait générer un rapport d\'incidents', async () => {
      // Mock des incidents
      const mockIncidents = [
        {
          _id: 'incident_id_1',
          bonFabrication: { _id: 'bon_id_1', numero: 'BF-2025-0001' },
          machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          type: 'Mécanique',
          description: 'Problème de cylindre',
          gravite: 'moyenne',
          dateDebut: new Date('2025-01-01'),
          dateFin: new Date('2025-01-01T02:00:00'),
          statut: 'resolu'
        },
        {
          _id: 'incident_id_2',
          bonFabrication: { _id: 'bon_id_2', numero: 'BF-2025-0002' },
          machine: { _id: 'machine_id_2', nom: 'Machine Test 2', type: 'heliogravure' },
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          type: 'Électrique',
          description: 'Court-circuit',
          gravite: 'elevee',
          dateDebut: new Date('2025-01-02'),
          dateFin: null,
          statut: 'en_cours'
        },
        {
          _id: 'incident_id_3',
          bonFabrication: { _id: 'bon_id_1', numero: 'BF-2025-0001' },
          machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
          personnel: { _id: 'user_id', firstName: 'Test', lastName: 'User' },
          type: 'Mécanique',
          description: 'Problème d\'alimentation papier',
          gravite: 'faible',
          dateDebut: new Da
(Content truncated due to size limit. Use line ranges to read in chunks)
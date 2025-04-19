import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Dashboard from '../src/pages/Dashboard/Dashboard';
import { fetchBonsFabrication } from '../src/store/slices/bonsFabricationSlice';

// Mock de redux-thunk
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock des actions
jest.mock('../src/store/slices/bonsFabricationSlice', () => ({
  fetchBonsFabrication: jest.fn()
}));

describe('Dashboard Component', () => {
  let store;
  
  beforeEach(() => {
    // Données de test pour le store
    const mockBons = [
      {
        _id: 'bon_id_1',
        numero: 'BF-2025-0001',
        date: '2025-01-01T00:00:00.000Z',
        etat: 'en_cours',
        client: { _id: 'client_id_1', nom: 'Client Test 1' },
        machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
        travail: { designation: 'Travail 1', quantite: 1000 }
      },
      {
        _id: 'bon_id_2',
        numero: 'BF-2025-0002',
        date: '2025-01-02T00:00:00.000Z',
        etat: 'termine',
        client: { _id: 'client_id_2', nom: 'Client Test 2' },
        machine: { _id: 'machine_id_2', nom: 'Machine Test 2', type: 'heliogravure' },
        travail: { designation: 'Travail 2', quantite: 2000 }
      }
    ];
    
    const mockIncidents = [
      {
        _id: 'incident_id_1',
        type: 'Mécanique',
        gravite: 'moyenne',
        statut: 'en_cours',
        dateDebut: '2025-01-01T10:00:00.000Z'
      },
      {
        _id: 'incident_id_2',
        type: 'Électrique',
        gravite: 'elevee',
        statut: 'ouvert',
        dateDebut: '2025-01-02T10:00:00.000Z'
      }
    ];
    
    const mockStats = {
      production: {
        total: 10,
        enAttente: 2,
        enCours: 3,
        termines: 5
      },
      qualite: {
        totalControles: 20,
        conformes: 18,
        tauxConformite: 90
      },
      incidents: {
        total: 5,
        ouverts: 2,
        enCours: 1,
        resolus: 2
      }
    };
    
    store = mockStore({
      auth: {
        userInfo: { _id: 'user_id', firstName: 'Test', lastName: 'User', role: 'admin' }
      },
      bonsFabrication: {
        bons: mockBons,
        loading: false,
        error: null
      },
      incidents: {
        incidents: mockIncidents,
        loading: false,
        error: null
      },
      stats: {
        dashboardStats: mockStats,
        loading: false,
        error: null
      }
    });
    
    // Réinitialiser les mocks
    jest.clearAllMocks();
    
    // Mock de l'action fetchBonsFabrication pour qu'elle retourne une promesse résolue
    fetchBonsFabrication.mockReturnValue(() => Promise.resolve());
  });
  
  it('devrait rendre le tableau de bord avec les statistiques', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );
    
    // Vérifier que le titre est affiché
    expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
    
    // Vérifier que les statistiques de production sont affichées
    expect(screen.getByText(/Production/i)).toBeInTheDocument();
    expect(screen.getByText(/10/i)).toBeInTheDocument(); // Total des bons
    expect(screen.getByText(/5/i)).toBeInTheDocument(); // Bons terminés
    
    // Vérifier que les statistiques de qualité sont affichées
    expect(screen.getByText(/Qualité/i)).toBeInTheDocument();
    expect(screen.getByText(/90%/i)).toBeInTheDocument(); // Taux de conformité
    
    // Vérifier que les statistiques d'incidents sont affichées
    expect(screen.getByText(/Incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/5/i)).toBeInTheDocument(); // Total des incidents
  });
  
  it('devrait afficher la liste des bons de fabrication récents', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );
    
    // Vérifier que le titre de la section est affiché
    expect(screen.getByText(/Bons de fabrication récents/i)).toBeInTheDocument();
    
    // Vérifier que les bons de fabrication sont affichés
    expect(screen.getByText(/BF-2025-0001/i)).toBeInTheDocument();
    expect(screen.getByText(/BF-2025-0002/i)).toBeInTheDocument();
    expect(screen.getByText(/Client Test 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Client Test 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Travail 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Travail 2/i)).toBeInTheDocument();
  });
  
  it('devrait afficher la liste des incidents récents', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );
    
    // Vérifier que le titre de la section est affiché
    expect(screen.getByText(/Incidents récents/i)).toBeInTheDocument();
    
    // Vérifier que les incidents sont affichés
    expect(screen.getByText(/Mécanique/i)).toBeInTheDocument();
    expect(screen.getByText(/Électrique/i)).toBeInTheDocument();
    expect(screen.getByText(/moyenne/i)).toBeInTheDocument();
    expect(screen.getByText(/elevee/i)).toBeInTheDocument();
  });
  
  it('devrait appeler fetchBonsFabrication au chargement', () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );
    
    // Vérifier que l'action fetchBonsFabrication a été appelée
    expect(fetchBonsFabrication).toHaveBeenCalled();
  });
  
  it('devrait afficher un indicateur de chargement pendant le chargement des données', () => {
    // Configurer le store avec l'état de chargement
    store = mockStore({
      auth: {
        userInfo: { _id: 'user_id', firstName: 'Test', lastName: 'User', role: 'admin' }
      },
      bonsFabrication: {
        bons: [],
        loading: true,
        error: null
      },
      incidents: {
        incidents: [],
        loading: true,
        error: null
      },
      stats: {
        dashboardStats: null,
        loading: true,
        error: null
      }
    });
    
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );
    
    // Vérifier que les indicateurs de chargement sont affichés
    expect(screen.getAllByTestId('loading-spinner').length).toBeGreaterThan(0);
  });
  
  it('devrait afficher un message d\'erreur en cas d\'échec de chargement', () => {
    // Configurer le store avec une erreur
    store = mockStore({
      auth: {
        userInfo: { _id: 'user_id', firstName: 'Test', lastName: 'User', role: 'admin' }
      },
      bonsFabrication: {
        bons: [],
        loading: false,
        error: 'Erreur lors du chargement des bons de fabrication'
      },
      incidents: {
        incidents: [],
        loading: false,
        error: null
      },
      stats: {
        dashboardStats: null,
        loading: false,
        error: null
      }
    });
    
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );
    
    // Vérifier que le message d'erreur est affiché
    expect(screen.getByText(/Erreur lors du chargement des bons de fabrication/i)).toBeInTheDocument();
  });
  
  it('devrait permettre de filtrer les bons de fabrication', async () => {
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );
    
    // Trouver le champ de recherche
    const searchInput = screen.getByPlaceholderText(/Rechercher/i);
    
    // Saisir un terme de recherche
    fireEvent.change(searchInput, { target: { value: 'BF-2025-0001' } });
    
    // Vérifier que l'action de recherche est déclenchée
    await waitFor(() => {
      expect(fetchBonsFabrication).toHaveBeenCalledWith({ search: 'BF-2025-0001' });
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BonFabricationForm from '../src/components/BonFabrication/BonFabricationForm';
import { createBonFabrication, updateBonFabrication } from '../src/store/slices/bonsFabricationSlice';

// Mock de redux-thunk
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock des actions
jest.mock('../src/store/slices/bonsFabricationSlice', () => ({
  createBonFabrication: jest.fn(),
  updateBonFabrication: jest.fn()
}));

describe('BonFabricationForm Component', () => {
  let store;
  
  beforeEach(() => {
    // Données de test pour le store
    const mockClients = [
      { _id: 'client_id_1', nom: 'Client Test 1' },
      { _id: 'client_id_2', nom: 'Client Test 2' }
    ];
    
    const mockMachines = [
      { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
      { _id: 'machine_id_2', nom: 'Machine Test 2', type: 'heliogravure' }
    ];
    
    const mockUsers = [
      { _id: 'user_id_1', firstName: 'User', lastName: 'One' },
      { _id: 'user_id_2', firstName: 'User', lastName: 'Two' }
    ];
    
    store = mockStore({
      auth: {
        userInfo: { _id: 'user_id', firstName: 'Test', lastName: 'User', role: 'admin' }
      },
      clients: {
        clients: mockClients,
        loading: false,
        error: null
      },
      machines: {
        machines: mockMachines,
        loading: false,
        error: null
      },
      users: {
        users: mockUsers,
        loading: false,
        error: null
      }
    });
    
    // Réinitialiser les mocks
    jest.clearAllMocks();
    
    // Mock des actions pour qu'elles retournent une promesse résolue
    createBonFabrication.mockReturnValue(() => Promise.resolve());
    updateBonFabrication.mockReturnValue(() => Promise.resolve());
  });
  
  it('devrait rendre le formulaire de création de bon de fabrication', () => {
    render(
      <Provider store={store}>
        <BonFabricationForm />
      </Provider>
    );
    
    // Vérifier que le titre est affiché
    expect(screen.getByText(/Nouveau Bon de Fabrication/i)).toBeInTheDocument();
    
    // Vérifier que les champs du formulaire sont affichés
    expect(screen.getByLabelText(/Client/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Machine/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Désignation du travail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantité/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Format/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Support/i)).toBeInTheDocument();
    expect(screen.getByText(/Couleurs/i)).toBeInTheDocument();
    expect(screen.getByText(/Finitions/i)).toBeInTheDocument();
    
    // Vérifier que le bouton de soumission est affiché
    expect(screen.getByRole('button', { name: /Créer/i })).toBeInTheDocument();
  });
  
  it('devrait rendre le formulaire de modification avec les données existantes', () => {
    const bonExistant = {
      _id: 'bon_id_1',
      client: { _id: 'client_id_1', nom: 'Client Test 1' },
      machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
      travail: {
        designation: 'Travail existant',
        quantite: 1000,
        format: 'A4',
        support: 'Papier couché',
        couleurs: ['Cyan', 'Magenta', 'Jaune', 'Noir'],
        finitions: ['Vernis']
      },
      personnel: [{ _id: 'user_id_1', firstName: 'User', lastName: 'One' }]
    };
    
    render(
      <Provider store={store}>
        <BonFabricationForm bon={bonExistant} />
      </Provider>
    );
    
    // Vérifier que le titre est affiché
    expect(screen.getByText(/Modifier Bon de Fabrication/i)).toBeInTheDocument();
    
    // Vérifier que les champs du formulaire sont pré-remplis
    expect(screen.getByDisplayValue(/Travail existant/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/1000/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/A4/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Papier couché/i)).toBeInTheDocument();
    
    // Vérifier que le bouton de soumission est affiché
    expect(screen.getByRole('button', { name: /Mettre à jour/i })).toBeInTheDocument();
  });
  
  it('devrait afficher des erreurs pour les champs obligatoires manquants', async () => {
    render(
      <Provider store={store}>
        <BonFabricationForm />
      </Provider>
    );
    
    // Cliquer sur le bouton de soumission sans remplir les champs
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }));
    
    // Vérifier que les messages d'erreur sont affichés
    await waitFor(() => {
      expect(screen.getByText(/Le client est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/La machine est requise/i)).toBeInTheDocument();
      expect(screen.getByText(/La désignation du travail est requise/i)).toBeInTheDocument();
      expect(screen.getByText(/La quantité est requise/i)).toBeInTheDocument();
    });
    
    // Vérifier que l'action createBonFabrication n'a pas été appelée
    expect(createBonFabrication).not.toHaveBeenCalled();
  });
  
  it('devrait appeler createBonFabrication avec les données correctes', async () => {
    render(
      <Provider store={store}>
        <BonFabricationForm />
      </Provider>
    );
    
    // Remplir les champs du formulaire
    fireEvent.change(screen.getByLabelText(/Client/i), {
      target: { value: 'client_id_1' }
    });
    
    fireEvent.change(screen.getByLabelText(/Machine/i), {
      target: { value: 'machine_id_1' }
    });
    
    fireEvent.change(screen.getByLabelText(/Désignation du travail/i), {
      target: { value: 'Nouveau travail' }
    });
    
    fireEvent.change(screen.getByLabelText(/Quantité/i), {
      target: { value: '1000' }
    });
    
    fireEvent.change(screen.getByLabelText(/Format/i), {
      target: { value: 'A4' }
    });
    
    fireEvent.change(screen.getByLabelText(/Support/i), {
      target: { value: 'Papier standard' }
    });
    
    // Sélectionner des couleurs
    fireEvent.click(screen.getByLabelText(/Cyan/i));
    fireEvent.click(screen.getByLabelText(/Noir/i));
    
    // Sélectionner des finitions
    fireEvent.click(screen.getByLabelText(/Vernis/i));
    
    // Sélectionner du personnel
    fireEvent.click(screen.getByLabelText(/User One/i));
    
    // Cliquer sur le bouton de soumission
    fireEvent.click(screen.getByRole('button', { name: /Créer/i }));
    
    // Vérifier que l'action createBonFabrication a été appelée avec les bonnes données
    await waitFor(() => {
      expect(createBonFabrication).toHaveBeenCalledWith({
        client: 'client_id_1',
        machine: 'machine_id_1',
        travail: {
          designation: 'Nouveau travail',
          quantite: 1000,
          format: 'A4',
          support: 'Papier standard',
          couleurs: ['Cyan', 'Noir'],
          finitions: ['Vernis']
        },
        personnel: ['user_id_1']
      });
    });
  });
  
  it('devrait appeler updateBonFabrication avec les données correctes', async () => {
    const bonExistant = {
      _id: 'bon_id_1',
      client: { _id: 'client_id_1', nom: 'Client Test 1' },
      machine: { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
      travail: {
        designation: 'Travail existant',
        quantite: 1000,
        format: 'A4',
        support: 'Papier couché',
        couleurs: ['Cyan', 'Magenta', 'Jaune', 'Noir'],
        finitions: ['Vernis']
      },
      personnel: [{ _id: 'user_id_1', firstName: 'User', lastName: 'One' }]
    };
    
    render(
      <Provider store={store}>
        <BonFabricationForm bon={bonExistant} />
      </Provider>
    );
    
    // Modifier certains champs du formulaire
    fireEvent.change(screen.getByLabelText(/Désignation du travail/i), {
      target: { value: 'Travail modifié' }
    });
    
    fireEvent.change(screen.getByLabelText(/Quantité/i), {
      target: { value: '2000' }
    });
    
    // Cliquer sur le bouton de soumission
    fireEvent.click(screen.getByRole('button', { name: /Mettre à jour/i }));
    
    // Vérifier que l'action updateBonFabrication a été appelée avec les bonnes données
    await waitFor(() => {
      expect(updateBonFabrication).toHaveBeenCalledWith({
        _id: 'bon_id_1',
        client: 'client_id_1',
        machine: 'machine_id_1',
        travail: {
          designation: 'Travail modifié',
          quantite: 2000,
          format: 'A4',
          support: 'Papier couché',
          couleurs: ['Cyan', 'Magenta', 'Jaune', 'Noir'],
          finitions: ['Vernis']
        },
        personnel: ['user_id_1']
      });
    });
  });
});

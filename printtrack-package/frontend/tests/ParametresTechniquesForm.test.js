import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ParametresTechniquesForm from '../src/components/ParametresTechniques/ParametresTechniquesForm';
import { addParametreTechnique, updateParametre } from '../src/store/slices/parametresTechniquesSlice';

// Mock de redux-thunk
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock des actions
jest.mock('../src/store/slices/parametresTechniquesSlice', () => ({
  addParametreTechnique: jest.fn(),
  updateParametre: jest.fn()
}));

describe('ParametresTechniquesForm Component', () => {
  let store;
  
  beforeEach(() => {
    // Données de test pour le store
    const mockBons = [
      { _id: 'bon_id_1', numero: 'BF-2025-0001' },
      { _id: 'bon_id_2', numero: 'BF-2025-0002' }
    ];
    
    const mockMachines = [
      { _id: 'machine_id_1', nom: 'Machine Test 1', type: 'offset' },
      { _id: 'machine_id_2', nom: 'Machine Test 2', type: 'heliogravure' }
    ];
    
    store = mockStore({
      auth: {
        userInfo: { _id: 'user_id', firstName: 'Test', lastName: 'User', role: 'operator' }
      },
      bonsFabrication: {
        bons: mockBons,
        loading: false,
        error: null
      },
      machines: {
        machines: mockMachines,
        loading: false,
        error: null
      }
    });
    
    // Réinitialiser les mocks
    jest.clearAllMocks();
    
    // Mock des actions pour qu'elles retournent une promesse résolue
    addParametreTechnique.mockReturnValue(() => Promise.resolve());
    updateParametre.mockReturnValue(() => Promise.resolve());
  });
  
  it('devrait rendre le formulaire d\'ajout de paramètre technique', () => {
    render(
      <Provider store={store}>
        <ParametresTechniquesForm bonId="bon_id_1" machineId="machine_id_1" />
      </Provider>
    );
    
    // Vérifier que le titre est affiché
    expect(screen.getByText(/Nouveau Paramètre Technique/i)).toBeInTheDocument();
    
    // Vérifier que les champs du formulaire sont affichés
    expect(screen.getByLabelText(/Type de paramètre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valeur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Unité/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Commentaire/i)).toBeInTheDocument();
    
    // Vérifier que le bouton de soumission est affiché
    expect(screen.getByRole('button', { name: /Ajouter/i })).toBeInTheDocument();
  });
  
  it('devrait rendre le formulaire de modification avec les données existantes', () => {
    const parametreExistant = {
      _id: 'parametre_id_1',
      bonFabrication: 'bon_id_1',
      machine: 'machine_id_1',
      type: 'Pression',
      valeur: 5.2,
      unite: 'bar',
      commentaire: 'Commentaire existant'
    };
    
    render(
      <Provider store={store}>
        <ParametresTechniquesForm parametre={parametreExistant} />
      </Provider>
    );
    
    // Vérifier que le titre est affiché
    expect(screen.getByText(/Modifier Paramètre Technique/i)).toBeInTheDocument();
    
    // Vérifier que les champs du formulaire sont pré-remplis
    expect(screen.getByDisplayValue(/Pression/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/5.2/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/bar/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Commentaire existant/i)).toBeInTheDocument();
    
    // Vérifier que le bouton de soumission est affiché
    expect(screen.getByRole('button', { name: /Mettre à jour/i })).toBeInTheDocument();
  });
  
  it('devrait afficher des erreurs pour les champs obligatoires manquants', async () => {
    render(
      <Provider store={store}>
        <ParametresTechniquesForm bonId="bon_id_1" machineId="machine_id_1" />
      </Provider>
    );
    
    // Cliquer sur le bouton de soumission sans remplir les champs
    fireEvent.click(screen.getByRole('button', { name: /Ajouter/i }));
    
    // Vérifier que les messages d'erreur sont affichés
    await waitFor(() => {
      expect(screen.getByText(/Le type de paramètre est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/La valeur est requise/i)).toBeInTheDocument();
      expect(screen.getByText(/L'unité est requise/i)).toBeInTheDocument();
    });
    
    // Vérifier que l'action addParametreTechnique n'a pas été appelée
    expect(addParametreTechnique).not.toHaveBeenCalled();
  });
  
  it('devrait appeler addParametreTechnique avec les données correctes', async () => {
    render(
      <Provider store={store}>
        <ParametresTechniquesForm bonId="bon_id_1" machineId="machine_id_1" />
      </Provider>
    );
    
    // Remplir les champs du formulaire
    fireEvent.change(screen.getByLabelText(/Type de paramètre/i), {
      target: { value: 'Pression' }
    });
    
    fireEvent.change(screen.getByLabelText(/Valeur/i), {
      target: { value: '5.2' }
    });
    
    fireEvent.change(screen.getByLabelText(/Unité/i), {
      target: { value: 'bar' }
    });
    
    fireEvent.change(screen.getByLabelText(/Commentaire/i), {
      target: { value: 'Nouveau commentaire' }
    });
    
    // Cliquer sur le bouton de soumission
    fireEvent.click(screen.getByRole('button', { name: /Ajouter/i }));
    
    // Vérifier que l'action addParametreTechnique a été appelée avec les bonnes données
    await waitFor(() => {
      expect(addParametreTechnique).toHaveBeenCalledWith({
        bonFabrication: 'bon_id_1',
        machine: 'machine_id_1',
        type: 'Pression',
        valeur: 5.2,
        unite: 'bar',
        commentaire: 'Nouveau commentaire'
      });
    });
  });
  
  it('devrait appeler updateParametre avec les données correctes', async () => {
    const parametreExistant = {
      _id: 'parametre_id_1',
      bonFabrication: 'bon_id_1',
      machine: 'machine_id_1',
      type: 'Pression',
      valeur: 5.2,
      unite: 'bar',
      commentaire: 'Commentaire existant'
    };
    
    render(
      <Provider store={store}>
        <ParametresTechniquesForm parametre={parametreExistant} />
      </Provider>
    );
    
    // Modifier certains champs du formulaire
    fireEvent.change(screen.getByLabelText(/Valeur/i), {
      target: { value: '5.5' }
    });
    
    fireEvent.change(screen.getByLabelText(/Commentaire/i), {
      target: { value: 'Commentaire modifié' }
    });
    
    // Cliquer sur le bouton de soumission
    fireEvent.click(screen.getByRole('button', { name: /Mettre à jour/i }));
    
    // Vérifier que l'action updateParametre a été appelée avec les bonnes données
    await waitFor(() => {
      expect(updateParametre).toHaveBeenCalledWith({
        _id: 'parametre_id_1',
        type: 'Pression',
        valeur: 5.5,
        unite: 'bar',
        commentaire: 'Commentaire modifié'
      });
    });
  });
});

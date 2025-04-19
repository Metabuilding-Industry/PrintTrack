import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Login from '../src/pages/Auth/Login';
import { login } from '../src/store/slices/authSlice';

// Mock de redux-thunk
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock du service d'authentification
jest.mock('../src/services/authService', () => ({
  login: jest.fn()
}));

// Mock de l'action login
jest.mock('../src/store/slices/authSlice', () => ({
  login: jest.fn()
}));

describe('Login Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      auth: {
        loading: false,
        error: null,
        userInfo: null
      }
    });
    
    // Réinitialiser les mocks
    jest.clearAllMocks();
  });
  
  it('devrait rendre le formulaire de connexion', () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    
    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });
  
  it('devrait afficher une erreur pour les champs vides', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    
    // Cliquer sur le bouton de connexion sans remplir les champs
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
    
    // Vérifier que les messages d'erreur sont affichés
    await waitFor(() => {
      expect(screen.getByText(/L'email est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/Le mot de passe est requis/i)).toBeInTheDocument();
    });
    
    // Vérifier que l'action login n'a pas été appelée
    expect(login).not.toHaveBeenCalled();
  });
  
  it('devrait afficher une erreur pour un email invalide', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    
    // Remplir le champ email avec une valeur invalide
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'invalid-email' }
    });
    
    // Remplir le champ mot de passe
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' }
    });
    
    // Cliquer sur le bouton de connexion
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
    
    // Vérifier que le message d'erreur est affiché
    await waitFor(() => {
      expect(screen.getByText(/Format d'email invalide/i)).toBeInTheDocument();
    });
    
    // Vérifier que l'action login n'a pas été appelée
    expect(login).not.toHaveBeenCalled();
  });
  
  it('devrait appeler l\'action login avec les identifiants corrects', async () => {
    // Mock de l'action login pour qu'elle retourne une promesse résolue
    login.mockReturnValue(() => Promise.resolve());
    
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    
    // Remplir le champ email
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    
    // Remplir le champ mot de passe
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' }
    });
    
    // Cliquer sur le bouton de connexion
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
    
    // Vérifier que l'action login a été appelée avec les bons paramètres
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
  
  it('devrait afficher un indicateur de chargement pendant la connexion', async () => {
    // Configurer le store avec l'état de chargement
    store = mockStore({
      auth: {
        loading: true,
        error: null,
        userInfo: null
      }
    });
    
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    
    // Vérifier que l'indicateur de chargement est affiché
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Vérifier que le bouton de connexion est désactivé
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeDisabled();
  });
  
  it('devrait afficher un message d\'erreur en cas d\'échec de connexion', async () => {
    // Configurer le store avec une erreur
    store = mockStore({
      auth: {
        loading: false,
        error: 'Identifiants invalides',
        userInfo: null
      }
    });
    
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    
    // Vérifier que le message d'erreur est affiché
    expect(screen.getByText(/Identifiants invalides/i)).toBeInTheDocument();
  });
});

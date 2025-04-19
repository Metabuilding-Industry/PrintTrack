import axios from 'axios';
import { LoginPayload, LoginResponse } from '../store/slices/authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configuration de l'intercepteur pour ajouter le token d'authentification
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  // Connexion utilisateur
  login: async (credentials: LoginPayload): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      throw new Error('Identifiants incorrects. Veuillez réessayer.');
    }
  },

  // Récupérer le profil utilisateur
  getUserProfile: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération du profil utilisateur');
    }
  },

  // Mettre à jour le profil utilisateur
  updateUserProfile: async (userData: any): Promise<any> => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, userData);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du profil utilisateur');
    }
  },

  // Récupérer tous les utilisateurs (admin)
  getUsers: async (): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/auth/users`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
  },

  // Récupérer un utilisateur par ID (admin)
  getUserById: async (id: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_URL}/auth/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
  },

  // Créer un nouvel utilisateur (admin)
  createUser: async (userData: any): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }
  },

  // Mettre à jour un utilisateur (admin)
  updateUser: async (id: string, userData: any): Promise<any> => {
    try {
      const response = await axios.put(`${API_URL}/auth/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
    }
  },

  // Supprimer un utilisateur (admin)
  deleteUser: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/auth/users/${id}`);
    } catch (error) {
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
  }
};

import axios from 'axios';
import { BonFabrication, BonFabricationInput } from '../types/bonFabrication';

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

export const bonsFabricationService = {
  // Récupérer tous les bons de fabrication
  getAllBons: async (): Promise<BonFabrication[]> => {
    try {
      const response = await axios.get(`${API_URL}/bons`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des bons de fabrication');
    }
  },

  // Récupérer un bon de fabrication par son ID
  getBonById: async (id: string): Promise<BonFabrication> => {
    try {
      const response = await axios.get(`${API_URL}/bons/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération du bon de fabrication');
    }
  },

  // Créer un nouveau bon de fabrication
  createBon: async (bonData: BonFabricationInput): Promise<BonFabrication> => {
    try {
      const response = await axios.post(`${API_URL}/bons`, bonData);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la création du bon de fabrication');
    }
  },

  // Mettre à jour un bon de fabrication
  updateBon: async (id: string, bonData: Partial<BonFabricationInput>): Promise<BonFabrication> => {
    try {
      const response = await axios.put(`${API_URL}/bons/${id}`, bonData);
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du bon de fabrication');
    }
  },

  // Supprimer un bon de fabrication
  deleteBon: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/bons/${id}`);
    } catch (error) {
      throw new Error('Erreur lors de la suppression du bon de fabrication');
    }
  },

  // Rechercher des bons de fabrication avec filtres
  searchBons: async (filters: any): Promise<BonFabrication[]> => {
    try {
      const response = await axios.get(`${API_URL}/bons/search`, { params: filters });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la recherche des bons de fabrication');
    }
  },

  // Changer le statut d'un bon de fabrication
  changeStatus: async (id: string, status: string): Promise<BonFabrication> => {
    try {
      const response = await axios.patch(`${API_URL}/bons/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors du changement de statut du bon de fabrication');
    }
  }
};

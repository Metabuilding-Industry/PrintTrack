import { Request, Response } from 'express';
import BonFabrication from '../models/BonFabrication';
import Client from '../models/Client';
import Machine from '../models/Machine';

// @desc    Créer un nouveau bon de fabrication
// @route   POST /api/bons
// @access  Private
export const createBonFabrication = async (req: Request, res: Response) => {
  try {
    const {
      date,
      etat,
      client,
      travail,
      machine,
      personnel
    } = req.body;

    // Vérifier si le client existe
    const clientExists = await Client.findById(client);
    if (!clientExists) {
      return res.status(400).json({ message: 'Client non trouvé' });
    }

    // Vérifier si la machine existe
    const machineExists = await Machine.findById(machine);
    if (!machineExists) {
      return res.status(400).json({ message: 'Machine non trouvée' });
    }

    // Créer le bon de fabrication
    const bonFabrication = await BonFabrication.create({
      date,
      etat,
      client,
      travail,
      machine,
      personnel
    });

    if (bonFabrication) {
      res.status(201).json(bonFabrication);
    } else {
      res.status(400).json({ message: 'Données invalides' });
    }
  } catch (error) {
    console.error('Erreur lors de la création du bon de fabrication:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer tous les bons de fabrication
// @route   GET /api/bons
// @access  Private
export const getBonsFabrication = async (req: Request, res: Response) => {
  try {
    const bons = await BonFabrication.find({})
      .populate('client', 'nom contact')
      .populate('machine', 'nom type')
      .populate('personnel', 'firstName lastName')
      .sort({ dateCreation: -1 });
    
    res.json(bons);
  } catch (error) {
    console.error('Erreur lors de la récupération des bons de fabrication:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer un bon de fabrication par ID
// @route   GET /api/bons/:id
// @access  Private
export const getBonFabricationById = async (req: Request, res: Response) => {
  try {
    const bon = await BonFabrication.findById(req.params.id)
      .populate('client')
      .populate('machine')
      .populate('personnel')
      .populate('parametres')
      .populate('controles')
      .populate('incidents')
      .populate('tempsProduction')
      .populate('documents');
    
    if (bon) {
      res.json(bon);
    } else {
      res.status(404).json({ message: 'Bon de fabrication non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du bon de fabrication:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour un bon de fabrication
// @route   PUT /api/bons/:id
// @access  Private
export const updateBonFabrication = async (req: Request, res: Response) => {
  try {
    const {
      date,
      etat,
      client,
      travail,
      machine,
      personnel
    } = req.body;

    const bon = await BonFabrication.findById(req.params.id);
    
    if (bon) {
      // Mettre à jour les champs
      bon.date = date || bon.date;
      bon.etat = etat || bon.etat;
      bon.client = client || bon.client;
      bon.travail = travail || bon.travail;
      bon.machine = machine || bon.machine;
      bon.personnel = personnel || bon.personnel;
      
      // Si le bon est terminé, ajouter la date de clôture
      if (etat === 'termine' && bon.etat !== 'termine') {
        bon.dateCloture = new Date();
      }
      
      // Mettre à jour la date de modification
      bon.dateModification = new Date();
      
      const updatedBon = await bon.save();
      res.json(updatedBon);
    } else {
      res.status(404).json({ message: 'Bon de fabrication non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bon de fabrication:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Supprimer un bon de fabrication
// @route   DELETE /api/bons/:id
// @access  Private/Admin
export const deleteBonFabrication = async (req: Request, res: Response) => {
  try {
    const bon = await BonFabrication.findById(req.params.id);
    
    if (bon) {
      await bon.remove();
      res.json({ message: 'Bon de fabrication supprimé' });
    } else {
      res.status(404).json({ message: 'Bon de fabrication non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du bon de fabrication:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Changer le statut d'un bon de fabrication
// @route   PATCH /api/bons/:id/status
// @access  Private
export const changeBonStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['en_attente', 'en_cours', 'termine', 'annule'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    
    const bon = await BonFabrication.findById(req.params.id);
    
    if (bon) {
      bon.etat = status;
      
      // Si le bon est terminé, ajouter la date de clôture
      if (status === 'termine') {
        bon.dateCloture = new Date();
      } else {
        bon.dateCloture = undefined;
      }
      
      // Mettre à jour la date de modification
      bon.dateModification = new Date();
      
      const updatedBon = await bon.save();
      res.json(updatedBon);
    } else {
      res.status(404).json({ message: 'Bon de fabrication non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors du changement de statut du bon de fabrication:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Rechercher des bons de fabrication avec filtres
// @route   GET /api/bons/search
// @access  Private
export const searchBonsFabrication = async (req: Request, res: Response) => {
  try {
    const {
      client,
      machine,
      etat,
      dateDebut,
      dateFin
    } = req.query;
    
    // Construire l'objet de filtre
    const filter: any = {};
    
    if (client) {
      filter.client = client;
    }
    
    if (machine) {
      filter.machine = machine;
    }
    
    if (etat) {
      filter.etat = etat;
    }
    
    // Filtre de date
    if (dateDebut || dateFin) {
      filter.date = {};
      
      if (dateDebut) {
        filter.date.$gte = new Date(dateDebut as string);
      }
      
      if (dateFin) {
        filter.date.$lte = new Date(dateFin as string);
      }
    }
    
    const bons = await BonFabrication.find(filter)
      .populate('client', 'nom contact')
      .populate('machine', 'nom type')
      .populate('personnel', 'firstName lastName')
      .sort({ dateCreation: -1 });
    
    res.json(bons);
  } catch (error) {
    console.error('Erreur lors de la recherche des bons de fabrication:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

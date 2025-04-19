import { Request, Response } from 'express';
import ParametreTechnique from '../models/ParametreTechnique';
import BonFabrication from '../models/BonFabrication';
import Machine from '../models/Machine';

// @desc    Ajouter un paramètre technique
// @route   POST /api/parametres
// @access  Private
export const addParametreTechnique = async (req: Request, res: Response) => {
  try {
    const {
      bonFabrication,
      machine,
      type,
      valeur,
      unite,
      commentaire
    } = req.body;

    // Vérifier si le bon de fabrication existe
    const bonExists = await BonFabrication.findById(bonFabrication);
    if (!bonExists) {
      return res.status(400).json({ message: 'Bon de fabrication non trouvé' });
    }

    // Vérifier si la machine existe
    const machineExists = await Machine.findById(machine);
    if (!machineExists) {
      return res.status(400).json({ message: 'Machine non trouvée' });
    }

    // Créer le paramètre technique
    const parametre = await ParametreTechnique.create({
      bonFabrication,
      machine,
      personnel: req.user._id,
      type,
      valeur,
      unite,
      dateReleve: new Date(),
      commentaire
    });

    if (parametre) {
      // Ajouter le paramètre au bon de fabrication
      await BonFabrication.findByIdAndUpdate(
        bonFabrication,
        { $push: { parametres: parametre._id } }
      );

      res.status(201).json(parametre);
    } else {
      res.status(400).json({ message: 'Données invalides' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du paramètre technique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer tous les paramètres techniques d'un bon de fabrication
// @route   GET /api/parametres/bon/:id
// @access  Private
export const getParametresByBon = async (req: Request, res: Response) => {
  try {
    const parametres = await ParametreTechnique.find({ bonFabrication: req.params.id })
      .populate('personnel', 'firstName lastName')
      .sort({ dateReleve: -1 });
    
    res.json(parametres);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres techniques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer un paramètre technique par ID
// @route   GET /api/parametres/:id
// @access  Private
export const getParametreById = async (req: Request, res: Response) => {
  try {
    const parametre = await ParametreTechnique.findById(req.params.id)
      .populate('bonFabrication')
      .populate('machine')
      .populate('personnel');
    
    if (parametre) {
      res.json(parametre);
    } else {
      res.status(404).json({ message: 'Paramètre technique non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du paramètre technique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour un paramètre technique
// @route   PUT /api/parametres/:id
// @access  Private
export const updateParametre = async (req: Request, res: Response) => {
  try {
    const {
      type,
      valeur,
      unite,
      commentaire
    } = req.body;

    const parametre = await ParametreTechnique.findById(req.params.id);
    
    if (parametre) {
      parametre.type = type || parametre.type;
      parametre.valeur = valeur || parametre.valeur;
      parametre.unite = unite || parametre.unite;
      parametre.commentaire = commentaire !== undefined ? commentaire : parametre.commentaire;
      
      const updatedParametre = await parametre.save();
      res.json(updatedParametre);
    } else {
      res.status(404).json({ message: 'Paramètre technique non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paramètre technique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Supprimer un paramètre technique
// @route   DELETE /api/parametres/:id
// @access  Private/Supervisor
export const deleteParametre = async (req: Request, res: Response) => {
  try {
    const parametre = await ParametreTechnique.findById(req.params.id);
    
    if (parametre) {
      // Retirer le paramètre du bon de fabrication
      await BonFabrication.findByIdAndUpdate(
        parametre.bonFabrication,
        { $pull: { parametres: parametre._id } }
      );
      
      await parametre.remove();
      res.json({ message: 'Paramètre technique supprimé' });
    } else {
      res.status(404).json({ message: 'Paramètre technique non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du paramètre technique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer les statistiques des paramètres techniques par machine
// @route   GET /api/parametres/stats/machine/:id
// @access  Private
export const getParametresStatsByMachine = async (req: Request, res: Response) => {
  try {
    const machineId = req.params.id;
    
    // Vérifier si la machine existe
    const machineExists = await Machine.findById(machineId);
    if (!machineExists) {
      return res.status(400).json({ message: 'Machine non trouvée' });
    }
    
    // Récupérer les types de paramètres uniques pour cette machine
    const types = await ParametreTechnique.distinct('type', { machine: machineId });
    
    // Pour chaque type, calculer les statistiques
    const stats = [];
    
    for (const type of types) {
      const parametres = await ParametreTechnique.find({ 
        machine: machineId,
        type
      }).sort({ dateReleve: -1 });
      
      if (parametres.length > 0) {
        // Calculer la moyenne
        const sum = parametres.reduce((acc, p) => acc + p.valeur, 0);
        const avg = sum / parametres.length;
        
        // Trouver le min et max
        const values = parametres.map(p => p.valeur);
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        // Récupérer la dernière valeur
        const latest = parametres[0];
        
        stats.push({
          type,
          unite: latest.unite,
          moyenne: avg,
          min,
          max,
          dernierReleve: latest.dateReleve,
          nombreRelevés: parametres.length
        });
      }
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

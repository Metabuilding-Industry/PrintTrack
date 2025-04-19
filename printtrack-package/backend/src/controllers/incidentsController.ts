import { Request, Response } from 'express';
import Incident from '../models/Incident';
import BonFabrication from '../models/BonFabrication';
import Machine from '../models/Machine';

// @desc    Ajouter un incident
// @route   POST /api/incidents
// @access  Private
export const addIncident = async (req: Request, res: Response) => {
  try {
    const {
      bonFabrication,
      machine,
      type,
      description,
      gravite,
      actionCorrective,
      impactProduction
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

    // Créer l'incident
    const incident = await Incident.create({
      bonFabrication,
      machine,
      personnel: req.user._id,
      type,
      description,
      gravite,
      dateDebut: new Date(),
      actionCorrective,
      statut: 'ouvert',
      impactProduction
    });

    if (incident) {
      // Ajouter l'incident au bon de fabrication
      await BonFabrication.findByIdAndUpdate(
        bonFabrication,
        { $push: { incidents: incident._id } }
      );

      // Si la gravité est critique, mettre la machine en maintenance
      if (gravite === 'critique') {
        await Machine.findByIdAndUpdate(
          machine,
          { statut: 'en_maintenance' }
        );
      }

      res.status(201).json(incident);
    } else {
      res.status(400).json({ message: 'Données invalides' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'incident:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer tous les incidents
// @route   GET /api/incidents
// @access  Private
export const getIncidents = async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.find({})
      .populate('bonFabrication', 'numero')
      .populate('machine', 'nom type')
      .populate('personnel', 'firstName lastName')
      .sort({ dateDebut: -1 });
    
    res.json(incidents);
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer tous les incidents d'un bon de fabrication
// @route   GET /api/incidents/bon/:id
// @access  Private
export const getIncidentsByBon = async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.find({ bonFabrication: req.params.id })
      .populate('machine', 'nom type')
      .populate('personnel', 'firstName lastName')
      .sort({ dateDebut: -1 });
    
    res.json(incidents);
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer tous les incidents d'une machine
// @route   GET /api/incidents/machine/:id
// @access  Private
export const getIncidentsByMachine = async (req: Request, res: Response) => {
  try {
    const incidents = await Incident.find({ machine: req.params.id })
      .populate('bonFabrication', 'numero')
      .populate('personnel', 'firstName lastName')
      .sort({ dateDebut: -1 });
    
    res.json(incidents);
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer un incident par ID
// @route   GET /api/incidents/:id
// @access  Private
export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('bonFabrication')
      .populate('machine')
      .populate('personnel');
    
    if (incident) {
      res.json(incident);
    } else {
      res.status(404).json({ message: 'Incident non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'incident:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour un incident
// @route   PUT /api/incidents/:id
// @access  Private
export const updateIncident = async (req: Request, res: Response) => {
  try {
    const {
      type,
      description,
      gravite,
      actionCorrective,
      statut,
      impactProduction
    } = req.body;

    const incident = await Incident.findById(req.params.id);
    
    if (incident) {
      incident.type = type || incident.type;
      incident.description = description || incident.description;
      incident.gravite = gravite || incident.gravite;
      incident.actionCorrective = actionCorrective !== undefined ? actionCorrective : incident.actionCorrective;
      incident.impactProduction = impactProduction !== undefined ? impactProduction : incident.impactProduction;
      
      // Si le statut change à résolu, ajouter la date de fin
      if (statut === 'resolu' && incident.statut !== 'resolu') {
        incident.dateFin = new Date();
      }
      
      incident.statut = statut || incident.statut;
      
      const updatedIncident = await incident.save();
      
      // Si l'incident est résolu et était critique, remettre la machine en disponible
      if (updatedIncident.statut === 'resolu' && updatedIncident.gravite === 'critique') {
        await Machine.findByIdAndUpdate(
          updatedIncident.machine,
          { statut: 'disponible' }
        );
      }
      
      res.json(updatedIncident);
    } else {
      res.status(404).json({ message: 'Incident non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'incident:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Supprimer un incident
// @route   DELETE /api/incidents/:id
// @access  Private/Supervisor
export const deleteIncident = async (req: Request, res: Response) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (incident) {
      // Retirer l'incident du bon de fabrication
      await BonFabrication.findByIdAndUpdate(
        incident.bonFabrication,
        { $pull: { incidents: incident._id } }
      );
      
      await incident.remove();
      res.json({ message: 'Incident supprimé' });
    } else {
      res.status(404).json({ message: 'Incident non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'incident:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer les statistiques des incidents
// @route   GET /api/incidents/stats
// @access  Private
export const getIncidentsStats = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin } = req.query;
    
    // Construire l'objet de filtre pour la date
    const dateFilter: any = {};
    
    if (dateDebut || dateFin) {
      dateFilter.dateDebut = {};
      
      if (dateDebut) {
        dateFilter.dateDebut.$gte = new Date(dateDebut as string);
      }
      
      if (dateFin) {
        dateFilter.dateDebut.$lte = new Date(dateFin as string);
      }
    }
    
    // Récupérer tous les incidents dans la période
    const incidents = await Incident.find(dateFilter);
    
    // Calculer les statistiques
    const total = incidents.length;
    const ouverts = incidents.filter(i => i.statut === 'ouvert').length;
    const enCours = incidents.filter(i => i.statut === 'en_cours').length;
    const resolus = incidents.filter(i => i.statut === 'resolu').length;
    
    // Regrouper par gravité
    const parGravite = {
      faible: incidents.filter(i => i.gravite === 'faible').length,
      moyenne: incidents.filter(i => i.gravite === 'moyenne').length,
      elevee: incidents.filter(i => i.gravite === 'elevee').length,
      critique: incidents.filter(i => i.gravite === 'critique').length
    };
    
    // Regrouper par type
    const typesIncidents = await Incident.aggregate([
      { $match: dateFilter },
      { $group: {
        _id: '$type',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Temps moyen de résolution (en minutes)
    const incidentsResolus = incidents.filter(i => i.statut === 'resolu' && i.dateFin);
    let tempsResolutionMoyen = 0;
    
    if (incidentsResolus.length > 0) {
      const tempsTotal = incidentsResolus.reduce((acc, i) => {
        const debut = new Date(i.dateDebut).getTime();
        const fin = new Date(i.dateFin!).getTime();
        return acc + (fin - debut) / (1000 * 60); // en minutes
      }, 0);
      
      tempsResolutionMoyen = tempsTotal / incidentsResolus.length;
    }
    
    res.json({
      total,
      ouverts,
      enCours,
      resolus,
      parGravite,
      typesIncidents,
      tempsResolutionMoyen
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des incidents:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

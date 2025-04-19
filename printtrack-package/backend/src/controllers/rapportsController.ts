import { Request, Response } from 'express';
import mongoose from 'mongoose';
import BonFabrication from '../models/BonFabrication';
import ParametreTechnique from '../models/ParametreTechnique';
import ControleQualite from '../models/ControleQualite';
import Incident from '../models/Incident';
import Machine from '../models/Machine';
import Client from '../models/Client';

// @desc    Générer un rapport de production
// @route   GET /api/rapports/production
// @access  Private
export const getProductionReport = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin, machine, client } = req.query;
    
    // Construire l'objet de filtre
    const filter: any = {};
    
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
    
    // Filtre de machine
    if (machine) {
      filter.machine = machine;
    }
    
    // Filtre de client
    if (client) {
      filter.client = client;
    }
    
    // Récupérer les bons de fabrication
    const bons = await BonFabrication.find(filter)
      .populate('client', 'nom')
      .populate('machine', 'nom type')
      .sort({ date: -1 });
    
    // Statistiques générales
    const total = bons.length;
    const enAttente = bons.filter(b => b.etat === 'en_attente').length;
    const enCours = bons.filter(b => b.etat === 'en_cours').length;
    const termines = bons.filter(b => b.etat === 'termine').length;
    const annules = bons.filter(b => b.etat === 'annule').length;
    
    // Statistiques par machine
    const statsMachines = await BonFabrication.aggregate([
      { $match: filter },
      { $lookup: {
        from: 'machines',
        localField: 'machine',
        foreignField: '_id',
        as: 'machineInfo'
      }},
      { $unwind: '$machineInfo' },
      { $group: {
        _id: '$machine',
        nom: { $first: '$machineInfo.nom' },
        type: { $first: '$machineInfo.type' },
        count: { $sum: 1 },
        termines: { $sum: { $cond: [{ $eq: ['$etat', 'termine'] }, 1, 0] } }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Statistiques par client
    const statsClients = await BonFabrication.aggregate([
      { $match: filter },
      { $lookup: {
        from: 'clients',
        localField: 'client',
        foreignField: '_id',
        as: 'clientInfo'
      }},
      { $unwind: '$clientInfo' },
      { $group: {
        _id: '$client',
        nom: { $first: '$clientInfo.nom' },
        count: { $sum: 1 },
        termines: { $sum: { $cond: [{ $eq: ['$etat', 'termine'] }, 1, 0] } }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Incidents par gravité
    const incidentsParGravite = await Incident.aggregate([
      { $match: { bonFabrication: { $in: bons.map(b => b._id) } } },
      { $group: {
        _id: '$gravite',
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Taux de conformité
    const controles = await ControleQualite.find({
      bonFabrication: { $in: bons.map(b => b._id) }
    });
    
    const totalControles = controles.length;
    const conformes = controles.filter(c => c.conforme).length;
    const tauxConformite = totalControles > 0 ? (conformes / totalControles) * 100 : 0;
    
    res.json({
      periode: {
        debut: dateDebut || 'Toutes dates',
        fin: dateFin || 'Toutes dates'
      },
      statistiquesGenerales: {
        total,
        enAttente,
        enCours,
        termines,
        annules,
        tauxCompletion: total > 0 ? (termines / total) * 100 : 0
      },
      statsMachines,
      statsClients,
      incidents: {
        parGravite: incidentsParGravite
      },
      qualite: {
        totalControles,
        conformes,
        nonConformes: totalControles - conformes,
        tauxConformite
      },
      bons: bons.map(b => ({
        _id: b._id,
        numero: b.numero,
        date: b.date,
        etat: b.etat,
        client: b.client,
        machine: b.machine,
        travail: b.travail.designation,
        quantite: b.travail.quantite
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport de production:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Générer un rapport de qualité
// @route   GET /api/rapports/qualite
// @access  Private
export const getQualiteReport = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin, machine } = req.query;
    
    // Construire l'objet de filtre
    const filter: any = {};
    
    // Filtre de date
    if (dateDebut || dateFin) {
      filter.dateControle = {};
      
      if (dateDebut) {
        filter.dateControle.$gte = new Date(dateDebut as string);
      }
      
      if (dateFin) {
        filter.dateControle.$lte = new Date(dateFin as string);
      }
    }
    
    // Récupérer les contrôles qualité
    let controles;
    
    if (machine) {
      // Si une machine est spécifiée, on doit joindre les bons de fabrication
      const machineId = new mongoose.Types.ObjectId(machine as string);
      
      controles = await ControleQualite.aggregate([
        { $lookup: {
          from: 'bonfabrications',
          localField: 'bonFabrication',
          foreignField: '_id',
          as: 'bonInfo'
        }},
        { $unwind: '$bonInfo' },
        { $match: {
          ...filter,
          'bonInfo.machine': machineId
        }},
        { $lookup: {
          from: 'users',
          localField: 'personnel',
          foreignField: '_id',
          as: 'personnelInfo'
        }},
        { $unwind: '$personnelInfo' },
        { $project: {
          _id: 1,
          pointControle: 1,
          valeurMesuree: 1,
          valeurReference: 1,
          toleranceMin: 1,
          toleranceMax: 1,
          unite: 1,
          conforme: 1,
          dateControle: 1,
          commentaire: 1,
          actionCorrective: 1,
          bonFabrication: 1,
          'bonInfo.numero': 1,
          'personnelInfo.firstName': 1,
          'personnelInfo.lastName': 1
        }}
      ]);
    } else {
      controles = await ControleQualite.find(filter)
        .populate('bonFabrication', 'numero')
        .populate('personnel', 'firstName lastName')
        .sort({ dateControle: -1 });
    }
    
    // Statistiques générales
    const total = controles.length;
    const conformes = controles.filter(c => c.conforme).length;
    const nonConformes = total - conformes;
    const tauxConformite = total > 0 ? (conformes / total) * 100 : 0;
    
    // Points de contrôle les plus problématiques
    const pointsControle = await ControleQualite.aggregate([
      { $match: filter },
      { $group: {
        _id: '$pointControle',
        total: { $sum: 1 },
        conformes: { $sum: { $cond: ['$conforme', 1, 0] } }
      }},
      { $project: {
        pointControle: '$_id',
        total: 1,
        conformes: 1,
        nonConformes: { $subtract: ['$total', '$conformes'] },
        tauxConformite: { $multiply: [{ $divide: ['$conformes', '$total'] }, 100] }
      }},
      { $sort: { tauxConformite: 1 } }
    ]);
    
    // Évolution dans le temps
    const evolution = await ControleQualite.aggregate([
      { $match: filter },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateControle' } },
        total: { $sum: 1 },
        conformes: { $sum: { $cond: ['$conforme', 1, 0] } }
      }},
      { $project: {
        date: '$_id',
        total: 1,
        conformes: 1,
        tauxConformite: { $multiply: [{ $divide: ['$conformes', '$total'] }, 100] }
      }},
      { $sort: { date: 1 } }
    ]);
    
    res.json({
      periode: {
        debut: dateDebut || 'Toutes dates',
        fin: dateFin || 'Toutes dates'
      },
      statistiquesGenerales: {
        total,
        conformes,
        nonConformes,
        tauxConformite
      },
      pointsControle,
      evolution,
      controles: controles.map(c => ({
        _id: c._id,
        pointControle: c.pointControle,
        valeurMesuree: c.valeurMesuree,
        valeurReference: c.valeurReference,
        toleranceMin: c.toleranceMin,
        toleranceMax: c.toleranceMax,
        unite: c.unite,
        conforme: c.conforme,
        dateControle: c.dateControle,
        bonFabrication: c.bonFabrication,
        personnel: c.personnel
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport de qualité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Générer un rapport d'incidents
// @route   GET /api/rapports/incidents
// @access  Private
export const getIncidentsReport = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin, machine, gravite } = req.query;
    
    // Construire l'objet de filtre
    const filter: any = {};
    
    // Filtre de date
    if (dateDebut || dateFin) {
      filter.dateDebut = {};
      
      if (dateDebut) {
        filter.dateDebut.$gte = new Date(dateDebut as string);
      }
      
      if (dateFin) {
        filter.dateDebut.$lte = new Date(dateFin as string);
      }
    }
    
    // Filtre de machine
    if (machine) {
      filter.machine = machine;
    }
    
    // Filtre de gravité
    if (gravite) {
      filter.gravite = gravite;
    }
    
    // Récupérer les incidents
    const incidents = await Incident.find(filter)
      .populate('bonFabrication', 'numero')
      .populate('machine', 'nom type')
      .populate('personnel', 'firstName lastName')
      .sort({ dateDebut: -1 });
    
    // Statistiques générales
    const total = incidents.length;
    const ouverts = incidents.filter(i => i.statut === 'ouvert').length;
    const enCours = incidents.filter(i => i.statut === 'en_cours').length;
    const resolus = incidents.filter(i => i.statut === 'resolu').length;
    
    // Incidents par gravité
    const parGravite = {
      faible: incidents.filter(i => i.gravite === 'faible').length,
      moyenne: incidents.filter(i => i.gravite === 'moyenne').length,
      elevee: incidents.filter(i => i.gravite === 'elevee').length,
      critique: incidents.filter(i => i.gravite === 'critique').length
    };
    
    // Incidents par machine
    const parMachine = await Incident.aggregate([
      { $match: filter },
      { $lookup: {
        from: 'machines',
        localField: 'machine',
        foreignField: '_id',
        as: 'machineInfo'
      }},
      { $unwind: '$machineInfo' },
      { $group: {
        _id: '$machine',
        nom: { $first: '$machineInfo.nom' },
        type: { $first: '$machineInfo.type' },
        count: { $sum: 1 },
        resolus: { $sum: { $cond: [{ $eq: ['$statut', 'resolu'] }, 1, 0] } }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Incidents par type
    const parType = await Incident.aggregate([
      { $match: filter },
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
      periode: {
        debut: dateDebut || 'Toutes dates',
        fin: dateFin || 'Toutes dates'
      },
      statistiquesGenerales: {
        total,
        ouverts,
        enCours,
        resolus,
        tauxResolution: total > 0 ? (resolus / total) * 100 : 0
      },
      parGravite,
      parMachine,
      parType,
      tempsResolutionMoyen,
      incidents: incidents.map(i => ({
        _id: i._id,
        type: i.type,
        description: i.description,
        gravite: i.gravite,
        dateDebut: i.dateDebut,
        dateFin: i.dateFin,
        statut: i.statut,
        bonFabrication: i.bonFabrication,
        machine: i.machine,
        personnel: i.personnel
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport d\'incidents:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Générer un rapport de performance des machines
// @route   GET /api/rapports/machines
// @access  Private
export const getMachinesReport = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin, type } = req.query;
    
    // Construire l'objet de filtre pour les machines
    const machineFilter: any = {};
    
    // Filtre de type
    if (type) {
      machineFilter.type = type;
    }
    
    // Récupérer toutes les machines
    const machines = await Machine.find(machineFilter);
    
    // Construire l'objet de filtre pour les bons de fabrication
    const bonFilter: any = {};
    
    // Filtre de date
    if (dateDebut || dateFin) {
      bonFilter.date = {};
      
      if (dateDebut) {
        bonFilter.date.$gte = new Date(dateDebut as string);
      }
      
      if (dateFin) {
        bonFilter.date.$lte = new Date(dateFin as string);
      }
    }
    
    // Statistiques par machine
    const statsParMachine = [];
    
    for (const machine of machines) {
      // Bons de fabrication pour cette machine
      const bons = await BonFabrication.find({
        ...bonFilter,
        machine: machine._id
      });
      
      // Incidents pour cette machine
      const incidents = await Incident.find({
        machine: machine._id,
        ...(dateDebut || dateFin ? {
          dateDebut: {
            ...(dateDebut ? { $gte: new Date(dateDebut as string) } : {}),
            ...(dateFin ? { $lte: new Date(dateFin as string) } : {})
          }
        } : {})
      });
      
      // Paramètres techniques pour cette machine
      const parametres = await ParametreTechnique.find({
        machine: machine._id,
        ...(dateDebut || dateFin ? {
          dateReleve: {
            ...(dateDebut ? { $gte: new Date(dateDebut as string) } : {}),
            ...(dateFin ? { $lte: new Date(dateFin as string) } : {})
          }
        } : {})
      });
      
      // Calcul des statistiques
      const totalBons = bons.length;
      const bonsTermines = bons.filter(b => b.etat === 'termine').length;
      const totalIncidents = incidents.length;
      const incidentsCritiques = incidents.filter(i => i.gravite === 'critique').length;
      
      // Temps d'arrêt total (en minutes)
      const tempsArretTotal = incidents.reduce((acc, i) => {
        if (i.tempsArret) {
          return acc + i.tempsArret;
        }
        return acc;
      }, 0);
      
      statsParMachine.push({
        _id: machine._id,
        nom: machine.nom,
        type: machine.type,
        statut: machine.statut,
        dateInstallation: machine.dateInstallation,
        dateDerniereRevision: machine.dateDerniereRevision,
        maintenancePlanifiee: machine.maintenancePlanifiee,
        production: {
          totalBons,
          bonsTermines,
          tauxCompletion: totalBons > 0 ? (bonsTermines / totalBons) * 100 : 0
        },
        incidents: {
          total: totalIncidents,
          critiques: incidentsCritiques,
          tempsArretTotal
        },
        parametres: {
          total: parametres.length
        }
      });
    }
    
    res.json({
      periode: {
        debut: dateDebut || 'Toutes dates',
        fin: dateFin || 'Toutes dates'
      },
      statistiquesGenerales: {
        totalMachines: machines.length,
        machinesActi
(Content truncated due to size limit. Use line ranges to read in chunks)
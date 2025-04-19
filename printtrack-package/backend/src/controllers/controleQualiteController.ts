import { Request, Response } from 'express';
import ControleQualite from '../models/ControleQualite';
import BonFabrication from '../models/BonFabrication';

// @desc    Ajouter un contrôle qualité
// @route   POST /api/controles
// @access  Private
export const addControleQualite = async (req: Request, res: Response) => {
  try {
    const {
      bonFabrication,
      pointControle,
      valeurMesuree,
      valeurReference,
      toleranceMin,
      toleranceMax,
      unite,
      conforme,
      commentaire,
      actionCorrective
    } = req.body;

    // Vérifier si le bon de fabrication existe
    const bonExists = await BonFabrication.findById(bonFabrication);
    if (!bonExists) {
      return res.status(400).json({ message: 'Bon de fabrication non trouvé' });
    }

    // Créer le contrôle qualité
    const controle = await ControleQualite.create({
      bonFabrication,
      personnel: req.user._id,
      pointControle,
      valeurMesuree,
      valeurReference,
      toleranceMin,
      toleranceMax,
      unite,
      conforme,
      dateControle: new Date(),
      commentaire,
      actionCorrective
    });

    if (controle) {
      // Ajouter le contrôle au bon de fabrication
      await BonFabrication.findByIdAndUpdate(
        bonFabrication,
        { $push: { controles: controle._id } }
      );

      res.status(201).json(controle);
    } else {
      res.status(400).json({ message: 'Données invalides' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du contrôle qualité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer tous les contrôles qualité d'un bon de fabrication
// @route   GET /api/controles/bon/:id
// @access  Private
export const getControlesByBon = async (req: Request, res: Response) => {
  try {
    const controles = await ControleQualite.find({ bonFabrication: req.params.id })
      .populate('personnel', 'firstName lastName')
      .sort({ dateControle: -1 });
    
    res.json(controles);
  } catch (error) {
    console.error('Erreur lors de la récupération des contrôles qualité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer un contrôle qualité par ID
// @route   GET /api/controles/:id
// @access  Private
export const getControleById = async (req: Request, res: Response) => {
  try {
    const controle = await ControleQualite.findById(req.params.id)
      .populate('bonFabrication')
      .populate('personnel');
    
    if (controle) {
      res.json(controle);
    } else {
      res.status(404).json({ message: 'Contrôle qualité non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du contrôle qualité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour un contrôle qualité
// @route   PUT /api/controles/:id
// @access  Private
export const updateControle = async (req: Request, res: Response) => {
  try {
    const {
      pointControle,
      valeurMesuree,
      valeurReference,
      toleranceMin,
      toleranceMax,
      unite,
      conforme,
      commentaire,
      actionCorrective
    } = req.body;

    const controle = await ControleQualite.findById(req.params.id);
    
    if (controle) {
      controle.pointControle = pointControle || controle.pointControle;
      controle.valeurMesuree = valeurMesuree !== undefined ? valeurMesuree : controle.valeurMesuree;
      controle.valeurReference = valeurReference !== undefined ? valeurReference : controle.valeurReference;
      controle.toleranceMin = toleranceMin !== undefined ? toleranceMin : controle.toleranceMin;
      controle.toleranceMax = toleranceMax !== undefined ? toleranceMax : controle.toleranceMax;
      controle.unite = unite || controle.unite;
      controle.conforme = conforme !== undefined ? conforme : controle.conforme;
      controle.commentaire = commentaire !== undefined ? commentaire : controle.commentaire;
      controle.actionCorrective = actionCorrective !== undefined ? actionCorrective : controle.actionCorrective;
      
      const updatedControle = await controle.save();
      res.json(updatedControle);
    } else {
      res.status(404).json({ message: 'Contrôle qualité non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contrôle qualité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Supprimer un contrôle qualité
// @route   DELETE /api/controles/:id
// @access  Private/Supervisor
export const deleteControle = async (req: Request, res: Response) => {
  try {
    const controle = await ControleQualite.findById(req.params.id);
    
    if (controle) {
      // Retirer le contrôle du bon de fabrication
      await BonFabrication.findByIdAndUpdate(
        controle.bonFabrication,
        { $pull: { controles: controle._id } }
      );
      
      await controle.remove();
      res.json({ message: 'Contrôle qualité supprimé' });
    } else {
      res.status(404).json({ message: 'Contrôle qualité non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du contrôle qualité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer les statistiques de conformité
// @route   GET /api/controles/stats/conformite
// @access  Private
export const getConformiteStats = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin } = req.query;
    
    // Construire l'objet de filtre pour la date
    const dateFilter: any = {};
    
    if (dateDebut || dateFin) {
      dateFilter.dateControle = {};
      
      if (dateDebut) {
        dateFilter.dateControle.$gte = new Date(dateDebut as string);
      }
      
      if (dateFin) {
        dateFilter.dateControle.$lte = new Date(dateFin as string);
      }
    }
    
    // Récupérer tous les contrôles dans la période
    const controles = await ControleQualite.find(dateFilter);
    
    // Calculer les statistiques
    const total = controles.length;
    const conformes = controles.filter(c => c.conforme).length;
    const nonConformes = total - conformes;
    const tauxConformite = total > 0 ? (conformes / total) * 100 : 0;
    
    // Regrouper par point de contrôle
    const pointsControle = await ControleQualite.aggregate([
      { $match: dateFilter },
      { $group: {
        _id: '$pointControle',
        total: { $sum: 1 },
        conformes: { $sum: { $cond: ['$conforme', 1, 0] } }
      }},
      { $project: {
        pointControle: '$_id',
        total: 1,
        conformes: 1,
        tauxConformite: { $multiply: [{ $divide: ['$conformes', '$total'] }, 100] }
      }},
      { $sort: { tauxConformite: 1 } }
    ]);
    
    res.json({
      total,
      conformes,
      nonConformes,
      tauxConformite,
      pointsControle
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de conformité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

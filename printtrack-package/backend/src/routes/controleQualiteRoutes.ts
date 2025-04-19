import express from 'express';
import {
  addControleQualite,
  getControlesByBon,
  getControleById,
  updateControle,
  deleteControle,
  getConformiteStats
} from '../controllers/controleQualiteController';
import { protect, supervisor } from '../middleware/authMiddleware';

const router = express.Router();

// Routes protégées (utilisateur connecté)
router.route('/')
  .post(protect, addControleQualite);

router.route('/:id')
  .get(protect, getControleById)
  .put(protect, updateControle)
  .delete(protect, supervisor, deleteControle);

router.route('/bon/:id')
  .get(protect, getControlesByBon);

router.route('/stats/conformite')
  .get(protect, getConformiteStats);

export default router;

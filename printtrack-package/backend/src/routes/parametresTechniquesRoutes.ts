import express from 'express';
import {
  addParametreTechnique,
  getParametresByBon,
  getParametreById,
  updateParametre,
  deleteParametre,
  getParametresStatsByMachine
} from '../controllers/parametresTechniquesController';
import { protect, supervisor } from '../middleware/authMiddleware';

const router = express.Router();

// Routes protégées (utilisateur connecté)
router.route('/')
  .post(protect, addParametreTechnique);

router.route('/:id')
  .get(protect, getParametreById)
  .put(protect, updateParametre)
  .delete(protect, supervisor, deleteParametre);

router.route('/bon/:id')
  .get(protect, getParametresByBon);

router.route('/stats/machine/:id')
  .get(protect, getParametresStatsByMachine);

export default router;

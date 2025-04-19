import express from 'express';
import {
  createBonFabrication,
  getBonsFabrication,
  getBonFabricationById,
  updateBonFabrication,
  deleteBonFabrication,
  changeBonStatus,
  searchBonsFabrication
} from '../controllers/bonsFabricationController';
import { protect, admin, supervisor } from '../middleware/authMiddleware';

const router = express.Router();

// Routes protégées (utilisateur connecté)
router.route('/')
  .get(protect, getBonsFabrication)
  .post(protect, createBonFabrication);

router.route('/search')
  .get(protect, searchBonsFabrication);

router.route('/:id')
  .get(protect, getBonFabricationById)
  .put(protect, updateBonFabrication)
  .delete(protect, admin, deleteBonFabrication);

router.route('/:id/status')
  .patch(protect, supervisor, changeBonStatus);

export default router;

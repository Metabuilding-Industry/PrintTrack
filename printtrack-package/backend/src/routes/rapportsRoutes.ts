import express from 'express';
import {
  getProductionReport,
  getQualiteReport,
  getIncidentsReport,
  getMachinesReport
} from '../controllers/rapportsController';
import { protect, supervisor } from '../middleware/authMiddleware';

const router = express.Router();

// Routes protégées (utilisateur connecté)
router.route('/production')
  .get(protect, getProductionReport);

router.route('/qualite')
  .get(protect, getQualiteReport);

router.route('/incidents')
  .get(protect, getIncidentsReport);

router.route('/machines')
  .get(protect, getMachinesReport);

export default router;

import express from 'express';
import {
  addIncident,
  getIncidents,
  getIncidentsByBon,
  getIncidentsByMachine,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getIncidentsStats
} from '../controllers/incidentsController';
import { protect, supervisor } from '../middleware/authMiddleware';

const router = express.Router();

// Routes protégées (utilisateur connecté)
router.route('/')
  .get(protect, getIncidents)
  .post(protect, addIncident);

router.route('/:id')
  .get(protect, getIncidentById)
  .put(protect, updateIncident)
  .delete(protect, supervisor, deleteIncident);

router.route('/bon/:id')
  .get(protect, getIncidentsByBon);

router.route('/machine/:id')
  .get(protect, getIncidentsByMachine);

router.route('/stats')
  .get(protect, getIncidentsStats);

export default router;

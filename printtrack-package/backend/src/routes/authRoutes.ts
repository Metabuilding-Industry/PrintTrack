import express from 'express';
import {
  login,
  register,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/authController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.post('/login', login);

// Routes protégées (utilisateur connecté)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Routes admin
router.route('/register').post(protect, admin, register);
router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;

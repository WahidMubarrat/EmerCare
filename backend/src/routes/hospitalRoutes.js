import express from 'express';
import { 
  registerHospital, 
  getAllHospitals, 
  getHospitalById, 
  loginHospital,
  updateHospitalProfile,
  changeHospitalPassword
} from '../controllers/hospitalController.js';

const router = express.Router();

// Register a new hospital
router.post('/register', registerHospital);

// Login hospital
router.post('/login', loginHospital);

// Update hospital profile
router.patch('/:id', updateHospitalProfile);

// Change hospital password
router.patch('/:id/password', changeHospitalPassword);

// Get all hospitals
router.get('/', getAllHospitals);

// Get hospital by ID
router.get('/:id', getHospitalById);

export default router;

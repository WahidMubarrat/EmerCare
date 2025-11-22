import express from 'express';
import { 
  registerAmbulance, 
  getAllAmbulances, 
  getAmbulanceById, 
  loginAmbulance,
  updateAmbulanceProfile,
  changeAmbulancePassword
} from '../controllers/ambulanceController.js';

const router = express.Router();

// Register a new ambulance service
router.post('/register', registerAmbulance);

// Login ambulance
router.post('/login', loginAmbulance);

// Update ambulance profile
router.patch('/:id', updateAmbulanceProfile);

// Change ambulance password
router.patch('/:id/password', changeAmbulancePassword);

// Get all ambulance services
router.get('/', getAllAmbulances);

// Get ambulance service by ID
router.get('/:id', getAmbulanceById);

export default router;

import express from 'express';
import { 
  registerDonor, 
  getAllDonors, 
  getDonorById, 
  loginDonor, 
  updateDonorAvailability,
  updateDonorProfile,
  changeDonorPassword
} from '../controllers/donorController.js';

const router = express.Router();

// Register a new donor
router.post('/register', registerDonor);

// Login donor
router.post('/login', loginDonor);

// Update donor availability
router.patch('/:id/availability', updateDonorAvailability);

// Update donor profile
router.patch('/:id', updateDonorProfile);

// Change donor password
router.patch('/:id/password', changeDonorPassword);

// Get all donors
router.get('/', getAllDonors);

// Get donor by ID
router.get('/:id', getDonorById);

export default router;

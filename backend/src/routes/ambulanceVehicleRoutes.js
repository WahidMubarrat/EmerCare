import express from 'express';
import {
  addAmbulanceVehicle,
  getVehiclesByOwner,
  getVehicleById,
  updateAmbulanceVehicle,
  deleteAmbulanceVehicle,
  toggleVehicleAvailability
} from '../controllers/ambulanceVehicleController.js';

const router = express.Router();

// Add new ambulance vehicle
router.post('/', addAmbulanceVehicle);

// Get all vehicles for a specific owner
router.get('/owner/:ownerId', getVehiclesByOwner);

// Get vehicle by ID
router.get('/:id', getVehicleById);

// Update vehicle
router.patch('/:id', updateAmbulanceVehicle);

// Toggle vehicle availability
router.patch('/:id/availability', toggleVehicleAvailability);

// Delete vehicle (soft delete)
router.delete('/:id', deleteAmbulanceVehicle);

export default router;

import express from 'express';
import {
  getHospitalServices,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  addService,
  updateService,
  deleteService,
  updateBeds,
  updateBloodBank
} from '../controllers/hospitalServiceController.js';

const router = express.Router();

router.get('/:hospitalId', getHospitalServices);
router.post('/:hospitalId/doctors', addDoctor);
router.patch('/:hospitalId/doctors/:doctorId', updateDoctor);
router.delete('/:hospitalId/doctors/:doctorId', deleteDoctor);

router.post('/:hospitalId/services', addService);
router.patch('/:hospitalId/services/:serviceId', updateService);
router.delete('/:hospitalId/services/:serviceId', deleteService);

router.put('/:hospitalId/beds', updateBeds);
router.put('/:hospitalId/blood-bank', updateBloodBank);

export default router;

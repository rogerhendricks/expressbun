import express from 'express';
import {
    createDoctor,
    getDoctor,
    getDoctors, 
    getDoctorPatients,
    updateDoctor, 
    deleteDoctor,
    findAll
} from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', protect, findAll);
router.get('/', protect, getDoctors);
router.post('/', protect, createDoctor);
router.get('/:id', protect, getDoctor);
router.patch('/:id', protect, updateDoctor);
router.delete('/:id', protect, deleteDoctor);
router.get('/:id/patients', protect, getDoctorPatients);

export default router;
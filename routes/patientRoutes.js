import express from 'express';

import {
    findAll,
    createPatient,
    getPatient,
    getPatients, 
    updatePatient, 
    deletePatient
} from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getPatients);
router.post('/', protect, createPatient);
router.get('/:id', protect, getPatient);
router.put('/:id', protect, updatePatient);
router.delete('/:id', protect, deletePatient);

export default router;
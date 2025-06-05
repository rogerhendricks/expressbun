import express from 'express';

import {
    findAll,
    createReport,
    getReport,
    getReportsByPatient, 
    updateReport, 
    deleteReport
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, findAll);
router.get('/patient/:id', protect, getReportsByPatient);
router.post('/', protect, createReport);
router.get('/:id', protect, getReport);
router.patch('/:id', protect, updateReport);
router.delete('/:id', protect, deleteReport);

export default router;
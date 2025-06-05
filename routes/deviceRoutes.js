import express from 'express';
import {
    createDevice,
    getDevice,
    getDevices, 
    updateDevice, 
    deleteDevice,
    findAll
} from '../controllers/deviceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', protect, findAll);
router.get('/', protect, getDevices);
router.post('/', protect, createDevice);
router.get('/:id', protect, getDevice);
router.patch('/:id', protect, updateDevice);
router.delete('/:id', protect, deleteDevice);
export default router;
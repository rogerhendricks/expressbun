const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');

// Route to block a specific time slot
router.post('/block', blockController.blockTimeSlot);

// Route to unblock a specific time slot
router.delete('/unblock/:id', blockController.unblockTimeSlot);

// Route to get all blocked slots
router.get('/blocked', blockController.getBlockedSlots);

// Route to block out a whole day
router.post('/block-day', blockController.blockDay);

// Route to unblock a whole day
router.delete('/unblock-day/:date', blockController.unblockWholeDay);

module.exports = router;
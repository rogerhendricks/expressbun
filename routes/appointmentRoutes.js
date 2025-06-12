const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Add this route for fetching all appointments
router.get('/', appointmentController.getAllAppointments);

// Route to book an appointment
router.post('/book', appointmentController.bookAppointment);

// Add this route for updating an appointment
router.put('/:appointmentId', appointmentController.updateAppointment);

// Route to retrieve available slots
router.get('/available-slots', appointmentController.getAvailableSlots);

// Route to manage remote clinic bookings
router.post('/remote-booking', appointmentController.manageRemoteClinicBooking);

// Route to get appointments for a specific patient
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);

// Route to cancel an appointment
router.delete('/:appointmentId', appointmentController.cancelAppointment);

module.exports = router;
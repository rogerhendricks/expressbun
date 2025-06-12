import asyncHandler from 'express-async-handler';
import prisma from "../utils/prisma.js";

// Get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            include: {
                patient: true
            },
            orderBy: {
                startTime: 'asc'
            }
        });
        
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error retrieving appointments:', error);
        res.status(500).json({ error: 'Error retrieving appointments' });
    }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
    const { patientId, startTime, endTime, isRemote, checkupType } = req.body;

    try {
        const appointment = await prisma.appointment.create({
            data: {
                patientId: parseInt(patientId),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isRemote: isRemote || false,
                checkupType,
                status: 'scheduled'
            },
            include: {
                patient: true
            }
        });
        
        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Error booking appointment' });
    }
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
    const { appointmentId } = req.params;
    const { patientId, startTime, endTime, isRemote, checkupType, status } = req.body;

    try {
        const appointment = await prisma.appointment.update({
            where: {
                id: parseInt(appointmentId)
            },
            data: {
                patientId: parseInt(patientId),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isRemote: isRemote || false,
                checkupType,
                status: status || 'scheduled'
            },
            include: {
                patient: true
            }
        });
        
        res.status(200).json(appointment);
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Error updating appointment' });
    }
};
// Get available slots
exports.getAvailableSlots = async (req, res) => {
    const { date } = req.query;

    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                startTime: {
                    gte: new Date(date),
                    lt: new Date(new Date(date).setHours(16)),
                },
            },
        });

        // Logic to calculate available slots based on appointments
        // ...

        res.status(200).json(availableSlots);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving available slots' });
    }
};

// Manage remote clinic bookings
exports.manageRemoteClinicBooking = async (req, res) => {
    const { patientId, checkupType } = req.body;

    try {
        // Logic to schedule remote clinic appointments based on checkup type
        // ...

        res.status(200).json({ message: 'Remote clinic booking managed' });
    } catch (error) {
        res.status(500).json({ error: 'Error managing remote clinic booking' });
    }
};

// Get appointments for a specific patient
exports.getAppointmentsByPatient = async (req, res) => {
    const { patientId } = req.params;
    
    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                patientId: parseInt(patientId)
            },
            include: {
                patient: true
            },
            orderBy: {
                startTime: 'asc'
            }
        });
        
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error retrieving patient appointments:', error);
        res.status(500).json({ error: 'Error retrieving patient appointments' });
    }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
    const { appointmentId } = req.params;
    
    try {
        const appointment = await prisma.appointment.update({
            where: {
                id: parseInt(appointmentId)
            },
            data: {
                status: 'cancelled'
            }
        });
        
        res.status(200).json({ message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'Error cancelling appointment' });
    }
};
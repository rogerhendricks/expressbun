import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { bookAppointment, updateAppointment, fetchPatients } from '../services/appointmentService';

const AppointmentModal = ({ isOpen, onRequestClose, appointment, onEventAdd, onEventUpdate }) => {
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        patientId: '',
        startTime: '',
        endTime: '',
        checkupType: '',
        isRemote: false,
    });

    useEffect(() => {
        // Load patients for the dropdown
        const loadPatients = async () => {
            try {
                const patientData = await fetchPatients();
                setPatients(patientData);
            } catch (error) {
                console.error('Error loading patients:', error);
            }
        };
        
        loadPatients();
    }, []);

    useEffect(() => {
        if (appointment) {
            // Format dates for the form inputs
            const formatDate = (date) => {
                if (!date) return '';
                const d = new Date(date);
                return d.toISOString().slice(0, 16); // format: "YYYY-MM-DDThh:mm"
            };

            setFormData({
                patientId: appointment.extendedProps?.patientId || '',
                startTime: formatDate(appointment.start),
                endTime: formatDate(appointment.end),
                checkupType: appointment.extendedProps?.checkupType || '',
                isRemote: appointment.extendedProps?.isRemote || false,
            });
        }
    }, [appointment]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const appointmentData = {
            patientId: parseInt(formData.patientId),
            startTime: new Date(formData.startTime),
            endTime: new Date(formData.endTime),
            checkupType: formData.checkupType,
            isRemote: formData.isRemote
        };

        try {
            if (appointment && !appointment.extendedProps?.isNewEvent) {
                // Update existing appointment
                await updateAppointment(appointment.id, appointmentData);
                if (onEventUpdate) onEventUpdate({ event: { ...appointment, ...appointmentData } });
            } else {
                // Create new appointment
                const result = await bookAppointment(appointmentData);
                if (onEventAdd) onEventAdd(result);
            }
            onRequestClose();
        } catch (error) {
            console.error('Error saving appointment:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <h2>{appointment && !appointment.extendedProps?.isNewEvent ? 'Edit Appointment' : 'Book Appointment'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>
                        Patient:
                        <select
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a patient</option>
                            {patients.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                
                <div className="form-group">
                    <label>
                        Start Time:
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                
                <div className="form-group">
                    <label>
                        End Time:
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                
                <div className="form-group">
                    <label>
                        Type of Checkup:
                        <select
                            name="checkupType"
                            value={formData.checkupType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select type</option>
                            <option value="annual">Annual Checkup</option>
                            <option value="biannual">Biannual Checkup</option>
                            <option value="followup">Follow-up</option>
                            <option value="urgent">Urgent Care</option>
                        </select>
                    </label>
                </div>
                
                <div className="form-group checkbox">
                    <label>
                        Remote Clinic:
                        <input
                            type="checkbox"
                            name="isRemote"
                            checked={formData.isRemote}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                
                <div className="form-actions">
                    <button type="submit">
                        {appointment && !appointment.extendedProps?.isNewEvent ? 'Update' : 'Book'}
                    </button>
                    <button type="button" onClick={onRequestClose}>Cancel</button>
                </div>
            </form>
        </Modal>
    );
};

export default AppointmentModal
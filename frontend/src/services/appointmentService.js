import axios from 'axios';

const API_URL = "/api/appointments"

// Appointment API calls
export const fetchAvailableSlots = async (date) => {
    const response = await axios.get(`${API_URL}/available-slots?date=${date}`);
    return response.data;
};

export const bookAppointment = async (appointmentData) => {
    const response = await axios.post(`${API_URL}/book`, appointmentData);
    return response.data;
};

export const updateAppointment = async (appointmentId, appointmentData) => {
    const response = await axios.put(`${API_URL}/${appointmentId}`, appointmentData);
    return response.data;
}

// This is an alias for bookAppointment to maintain compatibility
export const createAppointment = bookAppointment;

export const fetchAppointments = async () => {
    // There is no direct endpoint for this in the backend routes
    // You need to add a corresponding route in appointmentRoutes.js
    const response = await axios.get(`${API_URL}/`);
    return response.data;
};

export const fetchAppointmentsByPatient = async (patientId) => {
    const response = await axios.get(`${API_URL}/patient/${patientId}`);
    return response.data;
};

export const cancelAppointment = async (appointmentId) => {
    const response = await axios.delete(`${API_URL}/${appointmentId}`);
    return response.data;
};

export const bookRemoteClinic = async (appointmentData) => {
    const response = await axios.post(`${API_URL}/remote-booking`, appointmentData);
    return response.data;
};

// Block API calls
export const fetchBlockedSlots = async () => {
    const response = await axios.get(`${API_URL}/blocks/blocked`);
    return response.data;
};

export const blockTimeSlot = async (blockData) => {
    const response = await axios.post(`${API_URL}/blocks/block`, blockData);
    return response.data;
};

export const blockWholeDay = async (blockData) => {
    const response = await axios.post(`${API_URL}/blocks/block-day`, blockData);
    return response.data;
};

// Patient API calls
// export const createPatient = async (patientData) => {
//     const response = await axios.post(`${API_URL}/patients`, patientData);
//     return response.data;
// };

// export const fetchPatients = async () => {
//     const response = await axios.get(`${API_URL}/patients`);
//     return response.data;
// };

// // Report API calls
// export const fetchReports = async (params) => {
//     const response = await axios.get(`${API_URL}/reports`, { params });
//     return response.data;
// };

// export const fetchReportsByDateRange = async (startDate, endDate) => {
//     const response = await axios.get(`${API_URL}/reports/date-range?startDate=${startDate}&endDate=${endDate}`);
//     return response.data;
// };

// export const fetchVisitSummary = async () => {
//     const response = await axios.get(`${API_URL}/reports/summary`);
//     return response.data;
// };
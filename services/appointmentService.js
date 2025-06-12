import prisma from "../utils/prisma.js";

const BOOKING_INTERVAL = 15; // in minutes
const START_TIME = 8; // 8:00 AM
const END_TIME = 16; // 4:00 PM

const generateTimeSlots = () => {
    const slots = [];
    for (let hour = START_TIME; hour < END_TIME; hour++) {
        for (let minute = 0; minute < 60; minute += BOOKING_INTERVAL) {
            slots.push(`${hour}:${minute < 10 ? '0' : ''}${minute}`);
        }
    }
    return slots;
};

const getAvailableSlots = async (date) => {
    const appointments = await prisma.appointment.findMany({
        where: {
            date: new Date(date),
        },
    });

    const bookedSlots = appointments.map(appointment => appointment.time);
    const allSlots = generateTimeSlots();

    return allSlots.filter(slot => !bookedSlots.includes(slot));
};

const bookAppointment = async (patientId, date, time, remoteClinic = false) => {
    const appointment = await prisma.appointment.create({
        data: {
            patientId,
            date: new Date(date),
            time,
            remoteClinic,
        },
    });
    return appointment;
};

const blockTimeSlot = async (date, time) => {
    await prisma.blockedSlot.create({
        data: {
            date: new Date(date),
            time,
        },
    });
};

const unblockTimeSlot = async (date, time) => {
    await prisma.blockedSlot.deleteMany({
        where: {
            date: new Date(date),
            time,
        },
    });
};

const getBlockedSlots = async (date) => {
    const blockedSlots = await prisma.blockedSlot.findMany({
        where: {
            date: new Date(date),
        },
    });
    return blockedSlots.map(slot => slot.time);
};

module.exports = {
    getAvailableSlots,
    bookAppointment,
    blockTimeSlot,
    unblockTimeSlot,
    getBlockedSlots,
};
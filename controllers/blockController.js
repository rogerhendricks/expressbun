import prisma from "../utils/prisma.js";

// Block a specific time slot
exports.blockTimeSlot = async (req, res) => {
    const { date, startTime, endTime } = req.body;

    try {
        const blockedSlot = await prisma.blockedSlot.create({
            data: {
                date,
                startTime,
                endTime,
            },
        });
        res.status(201).json(blockedSlot);
    } catch (error) {
        res.status(500).json({ error: 'Failed to block time slot' });
    }
};

// Unblock a specific time slot
exports.unblockTimeSlot = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.blockedSlot.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to unblock time slot' });
    }
};

// Get all blocked slots
exports.getBlockedSlots = async (req, res) => {
    try {
        const blockedSlots = await prisma.blockedSlot.findMany();
        res.status(200).json(blockedSlots);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve blocked slots' });
    }
};

// Block an entire day
exports.blockDay = async (req, res) => {
    const { date } = req.body;

    try {
        const blockedDay = await prisma.blockedSlot.create({
            data: {
                date,
                startTime: '08:00',
                endTime: '16:00',
            },
        });
        res.status(201).json(blockedDay);
    } catch (error) {
        res.status(500).json({ error: 'Failed to block day' });
    }
};

exports.unblockWholeDay = async (req, res) => {
    const { date } = req.params;

    try {
        await prisma.blockedSlot.deleteMany({
            where: { date },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to unblock day' });
    }
}
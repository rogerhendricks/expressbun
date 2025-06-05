import asyncHandler from 'express-async-handler';
import prisma from "../utils/prisma.js";

// @desc    Get all devices
// @route   GET /api/devices
// @access  Private
const findAll = (req, res) => {
    prisma.device.findMany({
        select: {
            id: true,
            name: true,
            manufacturer: true,
            model: true,
            type: true,
            isMri: true
        }
    })
    .then(devices => {
        res.send(devices);
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
};

//@desc get devices matching query
// @route GET /api/devices?search=query
// @access Private
const getDevices = asyncHandler(async (req, res) => {
    const { search } = req.query;
    const devices = await prisma.device.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: search,
                    }
                },
                {
                    model: {
                        contains: search,
                    }
                }
            ]
        },
        select: {
            id: true,
            name: true,
            manufacturer: true,
        },
        take: 10
    });

    if (!devices.length) {
        return res.status(404).json({ error: 'No such device found' });
    }
    
    res.status(200).json(devices);
});

// @desc    Get single device
// @route   GET /api/devices/:id, using req.query instead of req.params /api/devices?id=1
// @access  Private
const getDevice = asyncHandler(async (req, res) => {
    const { id } = req.params
    const device = await prisma.device.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (!device) {
        return res.status(404).json({error: 'No such device found'})
    }
    
    res.status(200).json(device)
});

// @desc    Post create a device
// @route   POST /api/devices
// @access  Private
const createDevice = asyncHandler (async (req, res) => {
    const {model, manufacturer, type, isMri, name} = req.body
    // check if all fields are filled
    const requiredFields = ['model', 'manufacturer', 'type', 'isMri', 'name'];
    let emptyFields = [];
    
    requiredFields.forEach(field => {
      if (!req.body[field]) {
        emptyFields.push(field);
      }
    });
    
    if (emptyFields.length > 0) {
      return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
    }

    // add dev to db
    try {
        const deviceModel = await prisma.device.findMany({
            where: {
                model: model
            }
        })
        if (deviceModel.length > 0) {
            return res.status(400).json({error: 'Device already exists'})
        }
        const device = await prisma.device.create({
            data: {
                model,
                name,
                manufacturer,
                type,
                isMri
            }
        })
        res.status(200).json(device)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
    });

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private
const updateDevice = asyncHandler (async (req, res) => {
    const { id } = req.params
    const deviceId = parseInt(id, 10);
    const { model, manufacturer, type, isMri, name } = req.body
    if (!prisma.device.findUnique({
        where: {
            id: deviceId
        }
    })) {
        return res.status(404).json({error: 'No such device'})
    }

    const device = await prisma.device.update({
        where: {
            id: deviceId
        },
        data: {
            model,
            name,
            manufacturer,
            type,
            isMri
        }
    })    

    if (!device) {
        return res.status(400).json({error: 'No such device'})
    }
    res.status(200).json(device)
    // res.status(200).json({"hello":"hello"})
});

// @desc    Delete single device
// @route   DELETE /api/devices/id
// @access  Private
const deleteDevice = asyncHandler (async(req, res) => {
    const {id} = req.query
    if (!prisma.device.findUnique({
        where: {
            id: id
        }
    })) {
        return res.status(404).json({error: 'No such device'})
    }
    const device = await prisma.device.delete({
        where: {
            id: id
        }
    })
    
    if (!device){
        return res.status(400).json({error: 'No such device'})
    }
});

export {
    createDevice,
    getDevice,
    getDevices, 
    updateDevice,
    deleteDevice,
    findAll
}
import asyncHandler from 'express-async-handler';
import prisma from "../utils/prisma.js";

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const findAll = (req, res) => {
    prisma.lead.findMany({
        select: {
            id: true,
            name: true,
            manufacturer: true,
            model: true,
            type: true,
            isMri: true
        }
    })
    .then(leads => {
        res.send(leads);
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
};

//@desc get leads matching query
// @route GET /api/leads?search=query
// @access Private
const getLeads = asyncHandler(async (req, res) => {
    const { search } = req.query;
    const leads = await prisma.lead.findMany({
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

    if (!leads.length) {
        return res.status(404).json({ error: 'No such lead found' });
    }
    
    res.status(200).json(leads);
});

// @desc    Get single lead
// @route   GET /api/leads/:id, using req.query instead of req.params /api/leads?id=1
// @access  Private
const getLead = asyncHandler(async (req, res) => {
    const { id } = req.params
    const lead = await prisma.lead.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (!lead) {
        return res.status(404).json({error: 'No such lead found'})
    }
    
    res.status(200).json(lead)
});

// @desc    Post create a lead
// @route   POST /api/leads
// @access  Private
const createLead = asyncHandler (async (req, res) => {
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
        const leadModel = await prisma.lead.findMany({
            where: {
                model: model
            }
        })
        if (leadModel.length > 0) {
            return res.status(400).json({error: 'lead already exists'})
        }
        const lead = await prisma.lead.create({
            data: {
                model,
                name,
                manufacturer,
                type,
                isMri
            }
        })
        res.status(200).json(lead)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
    });

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updatelead = asyncHandler (async (req, res) => {
    const { id } = req.params
    const leadId = parseInt(id, 10);
    const { model, manufacturer, type, isMri, name } = req.body
    if (!prisma.lead.findUnique({
        where: {
            id: leadId
        }
    })) {
        return res.status(404).json({error: 'No such lead'})
    }

    const lead = await prisma.lead.update({
        where: {
            id: leadId
        },
        data: {
            model,
            name,
            manufacturer,
            type,
            isMri
        }
    })    

    if (!lead) {
        return res.status(400).json({error: 'No such lead'})
    }
    res.status(200).json(lead)
    // res.status(200).json({"hello":"hello"})
});

// @desc    Delete single lead
// @route   DELETE /api/leads/id
// @access  Private
const deleteLead = asyncHandler (async(req, res) => {
    const {id} = req.query
    if (!prisma.lead.findUnique({
        where: {
            id: id
        }
    })) {
        return res.status(404).json({error: 'No such lead'})
    }
    const lead = await prisma.lead.delete({
        where: {
            id: id
        }
    })
    
    if (!lead){
        return res.status(400).json({error: 'No such lead'})
    }
});

export {
    createLead,
    getLead,
    getLeads, 
    updateLead,
    deleteLead,
    findAll
}
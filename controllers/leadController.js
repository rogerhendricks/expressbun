import asyncHandler from 'express-async-handler';
import prisma from "../utils/prisma.js";

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
const findAll = (req, res) => {
    prisma.doctor.findMany()
    .then(doctors => {
        res.send(doctors);
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
};

// @dec get doctors matching query
// @route GET /api/doctors?search=query
// @access Private
const getDoctors = asyncHandler(async (req, res) => {
    const { search } = req.query;
    const doctors = await prisma.doctor.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: search,
                    }
                }
            ]
        },
        select: {
            id: true,
            name: true,
        },
        take: 10
    });

    if (!doctors.length) {
        return res.status(404).json({ error: 'No such doctor found' });
    }
    
    res.status(200).json(doctors);
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id using req.params,  /api/doctors/1 or /api/doctors/?_id=1 using req.query
// @access  Private
const getDoctor = asyncHandler(async (req, res) => {
    const { id } = req.params
    
    const doctor = await prisma.doctor.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            addresses: true
        }
    })
    if (!doctor) {
        return res.status(404).json({error: 'No such doctor found'})
    }
    res.status(200).json(doctor)
    // res.status(200).json({"id":_id})
});

// @desc    Get patients by doctor
// @route   GET /api/doctors/:id/patients
// @access  Private
const getDoctorPatients = asyncHandler(async (req, res) => {
    const { id } = req.params
    const doctorId = parseInt(id)
    const doctor = await prisma.doctor.findUnique({
        where: {
            id: doctorId
        },
        include: {
            patients:{
                select: {
                    id: true,
                    mrn: true,
                    fname: true,
                    lname: true,
                    phone: true
                }
            }
        }
    })
    if (!doctor) {
        return res.status(404).json({error: 'No such doctor found'})
    }
    res.status(200).json(doctor.patients)
});

// @desc    Post create a doctor
// @route   POST /api/doctors
// @access  Private
const createDoctor = asyncHandler (async (req, res) => {
    const {name, phone1, phone2, email, addresses} = req.body
    let emptyFields = []

    if(!name) {
        emptyFields.push('name')
    }
    if(!phone1) {
        emptyFields.push('phone1')
    }
    if(!addresses){
        emptyFields.push('addresses')
    }
    if(emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all the fields', emptyFields })
    }

    // add doc to db
    try {
        const doctor = await prisma.doctor.create(
            {
                data: {
                name,
                phone1,
                phone2,
                email,
                addresses: {
                    create: addresses.map(addr => ({
                      street: addr.street,
                      city: addr.city,
                      state: addr.state,
                      country: addr.country,
                      zip: addr.zip
                    }))
                  }
            }
        })
        res.status(200).json(doctor)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
    });

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private
const updateDoctor = asyncHandler (async (req, res) => {
    const { id } = req.params
    const doctorId = parseInt(id);
    const {name, phone1, phone2, email, addresses} = req.body
    if (!prisma.doctor.findUnique({
        where: {
            id:doctorId,
        }
    })) {
        return res.status(404).json({error: 'No such doctor'})
    }
    
    await prisma.address.deleteMany({
        where: {
          doctor_id: doctorId,
        },
      });

    const doctor = await prisma.doctor.update({
        where: {
            id: doctorId,
        },
        data: {
            id: doctorId,
            name,
            phone1,
            phone2,
            email,
            addresses:{
                create: addresses.map(addr => ({
                    street: addr.street,
                    city: addr.city,
                    state: addr.state,
                    zip: addr.zip
                }))
                  
            }
        },
        include: {
            addresses: true
        }
    })  

    if (!doctor) {
        return res.status(400).json({error: 'No such doctor'})
    }
    res.status(200).json(doctor)
});

// @desc    Delete single doctor
// @route   DELETE /api/doctor/id
// @access  Private
const deleteDoctor = asyncHandler (async(req, res) => {
    const {id} = req.query
    if (!prisma.doctor.findUnique({
        where: {
            id: id
        }
    })) {
        return res.status(404).json({error: 'No such doctor'})
    }
    const doctor = await prisma.doctor.delete({
        where: {
            id: id
        }
    })
    
    if (!doctor){
        return res.status(400).json({error: 'No such doctor'})
    }
});


export {
    createDoctor,
    getDoctorPatients,
    getDoctor,
    getDoctors, 
    updateDoctor,
    deleteDoctor,
    findAll
}
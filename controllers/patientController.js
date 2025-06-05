import asyncHandler from 'express-async-handler';
import prisma from "../utils/prisma.js";
import formatDateToYYYYMMDD from '../utils/dateConversion.js';

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const findAll = asyncHandler(async (req, res) => {
    try {
      const patients = await prisma.patient.findMany({
        include: {
          doctors: true,
          devices: true
        }
      });
      res.status(200).json(patients);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


// @desc    Get single patient
// @route   GET /api/patients/:id using request.params, /api/patients?id=1 using request.query
// @access  Private
const getPatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const patient = await prisma.patient.findUnique({
    where: { id: parseInt(id) },
    include: {
      doctors: true,
      devices: true,
      leads: true,
      medications: true,
    },
  });

  if (patient) {
    // Format the patient's dob
    patient.dob = formatDateToYYYYMMDD(patient.dob);
    
    // Format the implantedAt fields for devices and leads
    patient.devices = patient.devices.map(device => ({
      ...device,
      implantedAt: formatDateToYYYYMMDD(device.implantedAt),
    }));

    patient.leads = patient.leads.map(lead => ({
      ...lead,
      implantedAt: formatDateToYYYYMMDD(lead.implantedAt),
    }));

    // Include medication name and type in the medications array
    // patient.medications = patient.medications.map(pm => ({
    //   id: pm.id,
    //   createdAt: formatDateToYYYYMMDD(pm.createdAt),
    //   name: pm.medication.name,
    //   type: pm.medication.type,
    // }));

    res.status(200).json(patient);
  } else {
    res.status(404).json({ error: 'Patient not found' });
  }
});



// @desc Get pattients by search
// @route GET /api/patients/search
// @access Private
const getPatients = asyncHandler(async (req, res) => {
  const { search } = req.query
  const patients = await prisma.patient.findMany({
      where: {
          OR: [
              {
                  fname: {
                      contains: search
                  }
              },
              {
                  lname: {
                      contains: search
                  }
              },
              // {
              //     mrn: {
              //         contains: search
              //     }
              // }
          ]
      },
      select: {
          id: true,
          mrn: true,
          fname: true,
          lname: true,
          phone: true,
      },
      take: 10
  });

  if (!patients.length) {
      return res.status(404).json({error: 'No such patient found'})
  }
  
  res.status(200).json(patients)
});


// @desc    Create a patient
// @route   POST /api/patients/
// @access  Private
const createPatient = asyncHandler(async (req, res) => {
  const {
    mrn, fname, lname, dob, phone, email, street, city, state, country, postal, doctors, implantedDevices, implantedLeads, medications
  } = req.body;

  // Check if mandatory fields are filled
  let emptyFields = [];
  if (!fname) emptyFields.push('fname');
  if (!lname) emptyFields.push('lname');
  if (!mrn) emptyFields.push('mrn');
  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
  }

  // See if MRN already exists in db
  const existingPatient = await prisma.patient.findUnique({
    where: { mrn: parseInt(mrn) },
  });
  if (existingPatient) {
    return res.status(400).json({ error: "Medical Record number already exists." });
  }

  try {
    // First, create the patient
    const patient = await prisma.patient.create({
      data: {
        mrn: parseInt(mrn),
        fname,
        lname,
        dob: new Date(dob),
        phone,
        email,
        street,
        city,
        state,
        country,
        postal,
        doctors: {
          connect: doctors.map((doctor)=> ({ id: parseInt(doctor.id) })),
        },
        medications: medications.map(medication => ({id: medication.id})),
      },
    });

    // Use the created patient's id to create devices and leads
    const deviceData = implantedDevices.map(device => ({
      patientId: patient.id,
      deviceId: parseInt(device.deviceId),
      serial: device.serial,
      implantedAt: new Date(device.implantedAt),
    }));

    const leadData = implantedLeads.map(lead => ({
      patientId: patient.id,
      leadId: parseInt(lead.leadId),
      serial: lead.serial,
      chamber: lead.chamber,
      implantedAt: new Date(lead.implantedAt),
    }));
    // const medicationData = medications.map(medication => ({
    //   patientId: patient.id,
    //   medicationId: medication.id,
    // }));

    // Create the related devices and leads
    await prisma.implantedDevice.createMany({ data: deviceData });
    await prisma.implantedLead.createMany({ data: leadData });
    // await prisma.medications.createMany({ data: medicationData });

    res.status(201).json({ patient, implantedDevices: deviceData, implantedLeads: leadData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


/// @desc    Update a patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { mrn, fname, lname, dob, phone, email, street, city, state, country, postal, doctors, devices, leads, medications } = req.body;

  try {

    const patient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        mrn: parseInt(mrn),
        fname,
        lname,
        dob: new Date(dob),
        phone,
        email,
        street,
        city,
        state,
        country,
        postal,
        doctors: {
          set: doctors.map(doctor => ({ id: parseInt(doctor.id)}))
        },
        medications:{
          set: medications.map(medication => ({id: parseInt(medication.id)}))
        },
        devices: {
          deleteMany: {},
          create: devices.map(device => ({
            serial: device.serial,
            implantedAt: new Date(device.implantedAt),
            device: {
              connect: { id: parseInt(device.deviceId ) }
            }
          }))
        },
        leads: {
          deleteMany: {},
          create: leads.map(lead => ({
            serial: lead.serial,
            implantedAt: new Date(lead.implantedAt),
            chamber: lead.chamber,
            lead: {
              connect: {id: parseInt(lead.leadId)}
            }
          }))
      },
      // medications: {
      //   deleteMany: {},
      //   create: medications.map(medication => ({
      //     patientId: patient.id,
      //     medicationId: medication.id,
      //     id: medication.id,
          // medication: {
          //   connect: { id: parseInt(medication.id) }
          // }
        // }))
      
      },
      include: {
        doctors: true,
        devices: true,
        leads: true,
        medications: true
      }
    });
    
    res.status(200).json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @desc    Delete a patient
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.patient.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export {
  findAll,
  getPatients,
  createPatient,
  getPatient,
  updatePatient,
  deletePatient
};
import asyncHandler from "express-async-handler";
import prisma from "../utils/prisma.js";

// @desc    Fetch all medications
// @route   GET /api/medications
// @access  Private
const findAll = (req, res) => {
  prisma.medication.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
    })
    .then((medications) => {
      res.send(medications);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};

//@desc get medications matching query
// @route GET /api/medications?search=query
// @access Private
const getMedications = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const medications = await prisma.medication.findMany({
    where: {
      OR: [
        {
          name: {
            contains: search,
          },
        },
        {
          type: {
            contains: search,
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      type: true,
    },
    take: 10,
  });

  if (!medications.length) {
    return res.status(404).json({ error: "No such medication found" });
  }

  res.status(200).json(medications);
});

// @desc    Get medication by ID
// @route   GET /api/medications/:id
// @access  Private
const getMedicationById = asyncHandler(async (req, res) => {
  const medication = await prisma.medication.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!medication) {
    return res.status(404).json({ error: "No such medication found" });
  }

  res.status(200).json(medication);
});

// @desc    Create a new medication
// @route   POST /api/medications
// @access  Private
const createMedication = asyncHandler(async (req, res) => {
  const { name, type } = req.body;
  const requiredFields = ["name", "type"];
  let emptyFields = [];

  requiredFields.forEach((field) => {
    if (!req.body[field]) {
      emptyFields.push(field);
    }
  });

  if (emptyFields.length) {
    return res
      .status(400)
      .json({ error: `Missing required fields: ${emptyFields.join(", ")}` });
  }

  try {
    const medicationName = await prisma.medication.findMany({
      where: {
        OR: [
          { name: name },
          { name: name.charAt(0).toUpperCase() + name.slice(1) },
          { name: name.charAt(0).toLowerCase() + name.slice(1) }
      ]
      },
    });

    if (medicationName.length > 0) {
      return res.status(400).json({ error: "Medication already exists" });
    }
    const medication = await prisma.medication.create({
      data: {
        name,
        type,
      },
    });

    res.status(201).json(medication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Update a medication
// @route   PUT /api/medications/:id
// @access  Private
const updateMedication = asyncHandler(async (req, res) => {
  const { name, type } = req.body;
  const medication = await prisma.medication.update({
    where: {
      id: parseInt(req.params.id),
    },
    data: {
      name,
      type,
    },
  });

  res.status(200).json(medication);
});

// @desc    Delete a medication
// @route   DELETE /api/medications/:id
// @access  Private
const deleteMedication = asyncHandler(async (req, res) => {
  const medication = await prisma.medication.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.status(200).json(medication);
});

export {
  findAll,
  getMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
};
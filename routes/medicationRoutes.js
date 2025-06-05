import express from "express";
import {
  findAll,
  getMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
} from "../controllers/medicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all", protect, findAll);
router.get("/", protect, getMedications);
router.post("/", protect, createMedication);
router.get("/:id", protect, getMedicationById);
router.patch("/:id", protect, updateMedication);
router.delete("/:id", protect, deleteMedication);
export default router;
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { ROLES } from "../config/constants.js";
import {
  aadhaarLookupSchema,
  getMyPatientProfile,
  getPatientByAadhaar,
  getPatientById,
  patientIdSchema,
  updatePatient,
  updatePatientSchema
} from "../controllers/patient.controller.js";

export const patientRoutes = Router();

patientRoutes.get("/me", requireAuth, requireRole(ROLES.PATIENT), getMyPatientProfile);
patientRoutes.get(
  "/aadhaar/:aadhaarNumber",
  requireAuth,
  requireRole(ROLES.DOCTOR),
  validate(aadhaarLookupSchema),
  getPatientByAadhaar
);
patientRoutes.get(
  "/:patientId",
  requireAuth,
  requireRole(ROLES.DOCTOR),
  validate(patientIdSchema),
  getPatientById
);
patientRoutes.patch(
  "/:patientId",
  requireAuth,
  requireRole(ROLES.DOCTOR),
  validate(updatePatientSchema),
  updatePatient
);


import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { ROLES } from "../config/constants.js";
import { upload } from "../middleware/upload.js";
import {
  analyzeReport,
  analyzeReportSchema,
  deleteReport,
  deleteReportSchema,
  listReportsByPatient,
  listReportsSchema,
  uploadReport,
  uploadReportSchema
} from "../controllers/report.controller.js";

export const reportRoutes = Router();

reportRoutes.post(
  "/upload",
  requireAuth,
  requireRole(ROLES.DOCTOR, ROLES.PATIENT),
  upload.single("file"),
  validate(uploadReportSchema),
  uploadReport
);

reportRoutes.get(
  "/patient/:patientId",
  requireAuth,
  requireRole(ROLES.DOCTOR, ROLES.PATIENT),
  validate(listReportsSchema),
  listReportsByPatient
);

reportRoutes.post(
  "/:reportId/analyze",
  requireAuth,
  requireRole(ROLES.DOCTOR, ROLES.PATIENT),
  validate(analyzeReportSchema),
  analyzeReport
);

reportRoutes.delete(
  "/:reportId",
  requireAuth,
  requireRole(ROLES.DOCTOR, ROLES.PATIENT),
  validate(deleteReportSchema),
  deleteReport
);


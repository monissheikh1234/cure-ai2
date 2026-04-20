import { z } from "zod";
import { Patient } from "../models/Patient.js";
import { User } from "../models/User.js";
import { ROLES } from "../config/constants.js";

export async function getMyPatientProfile(req, res, next) {
  try {
    if (req.user.role !== ROLES.PATIENT) {
      return res.status(403).json({ error: "Forbidden", message: "Only patients can access this route" });
    }

    const patient = await Patient.findOne({ userId: req.user.sub });
    if (!patient) return res.status(404).json({ error: "NotFound", message: "Patient profile not found" });

    return res.json({ patient });
  } catch (err) {
    return next(err);
  }
}

export const aadhaarLookupSchema = z.object({
  params: z.object({
    aadhaarNumber: z.string().regex(/^\d{12}$/)
  })
});

export async function getPatientByAadhaar(req, res, next) {
  try {
    const { aadhaarNumber } = req.validated.params;
    const patient = await Patient.findOne({ aadhaarNumber });
    if (!patient) return res.status(404).json({ error: "NotFound", message: "Patient not found" });

    const user = patient.userId ? await User.findById(patient.userId).select("email role name") : null;
    return res.json({ patient, user });
  } catch (err) {
    return next(err);
  }
}

export const patientIdSchema = z.object({
  params: z.object({
    patientId: z.string().min(1)
  })
});

export async function getPatientById(req, res, next) {
  try {
    const { patientId } = req.validated.params;
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "NotFound", message: "Patient not found" });

    const user = patient.userId ? await User.findById(patient.userId).select("email role name") : null;
    return res.json({ patient, user });
  } catch (err) {
    return next(err);
  }
}

export const updatePatientSchema = z.object({
  params: z.object({
    patientId: z.string().min(1)
  }),
  body: z
    .object({
      diseases: z
        .array(
          z.object({
            name: z.string().min(2).max(120),
            organ: z.string().max(60).optional(),
            notes: z.string().max(500).optional()
          })
        )
        .optional(),
      medications: z
        .array(
          z.object({
            name: z.string().min(2).max(120),
            dosage: z.string().max(120).optional(),
            frequency: z.string().max(120).optional(),
            duration: z.string().max(120).optional()
          })
        )
        .optional()
    })
    .strict()
});

export async function updatePatient(req, res, next) {
  try {
    const { patientId } = req.validated.params;
    const { diseases, medications } = req.validated.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "NotFound", message: "Patient not found" });

    if (typeof diseases !== "undefined") patient.diseases = diseases;
    if (typeof medications !== "undefined") patient.medications = medications;
    await patient.save();

    return res.json({ patient });
  } catch (err) {
    return next(err);
  }
}


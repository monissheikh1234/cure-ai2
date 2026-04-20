import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { Report } from "../models/Report.js";
import { Patient } from "../models/Patient.js";
import { ROLES } from "../config/constants.js";
import { extractReportText } from "../utils/reportText.js";
import { analyzeMedicalReport } from "../services/gemini.service.js";

export const uploadReportSchema = z.object({
  body: z.object({
    patientId: z.string().min(1)
  })
});

function canAccessPatient(reqUser, patient) {
  if (reqUser.role === ROLES.DOCTOR) return true;
  if (reqUser.role === ROLES.PATIENT) return String(patient.userId) === String(reqUser.sub);
  return false;
}

export async function uploadReport(req, res, next) {
  try {
    const { patientId } = req.validated.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "ValidationError", message: "Missing file" });

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "NotFound", message: "Patient not found" });
    if (!canAccessPatient(req.user, patient)) {
      return res.status(403).json({ error: "Forbidden", message: "Cannot upload for this patient" });
    }

    const fileURL = `/uploads/${path.basename(file.path)}`;
    const extractedText = await extractReportText({
      filePath: file.path,
      mimeType: file.mimetype
    });

    const report = await Report.create({
      patientId: patient._id,
      uploadedByUserId: req.user.sub,
      fileURL,
      fileMimeType: file.mimetype,
      originalName: file.originalname,
      extractedText
    });

    // Track AI analysis status for transparency on the client.
    let aiStatus = "skipped";
    let aiError = null;

    // Attempt AI analysis if we have text; do not fail upload if Gemini errors.
    if (extractedText && extractedText.length >= 30) {
      try {
        const analysis = await analyzeMedicalReport(extractedText.slice(0, 12000));
        report.summary = analysis.summary;
        report.explanation = analysis.explanation;
        report.recommendations = analysis.recommendations;
        await report.save();
        aiStatus = "success";
      } catch (err) {
        aiStatus = "failed";
        aiError = err.message || "Gemini analysis failed";
        // eslint-disable-next-line no-console
        console.error("Gemini analysis failed during upload", err);
      }
    } else {
      aiStatus = "no_text";
    }

    return res.status(201).json({ report, aiStatus, aiError });
  } catch (err) {
    return next(err);
  }
}

export const listReportsSchema = z.object({
  params: z.object({
    patientId: z.string().min(1)
  })
});

export async function listReportsByPatient(req, res, next) {
  try {
    const { patientId } = req.validated.params;
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "NotFound", message: "Patient not found" });
    if (!canAccessPatient(req.user, patient)) {
      return res.status(403).json({ error: "Forbidden", message: "Cannot view this patient's reports" });
    }

    const reports = await Report.find({ patientId }).sort({ createdAt: -1 });
    return res.json({ reports });
  } catch (err) {
    return next(err);
  }
}

export const analyzeReportSchema = z.object({
  params: z.object({
    reportId: z.string().min(1)
  })
});

export async function analyzeReport(req, res, next) {
  try {
    const { reportId } = req.validated.params;
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "NotFound", message: "Report not found" });

    const patient = await Patient.findById(report.patientId);
    if (!patient) return res.status(404).json({ error: "NotFound", message: "Patient not found" });
    if (!canAccessPatient(req.user, patient)) {
      return res.status(403).json({ error: "Forbidden", message: "Cannot analyze this report" });
    }

    if (!report.extractedText || report.extractedText.length < 30) {
      return res.status(400).json({
        error: "BadRequest",
        message: "No extractable text available for this report (PDF text extraction failed or image OCR not enabled)."
      });
    }

    const analysis = await analyzeMedicalReport(report.extractedText.slice(0, 12000));
    report.summary = analysis.summary;
    report.explanation = analysis.explanation;
    report.recommendations = analysis.recommendations;
    await report.save();

    return res.json({ report });
  } catch (err) {
    return next(err);
  }
}

export const deleteReportSchema = z.object({
  params: z.object({
    reportId: z.string().min(1)
  })
});

export async function deleteReport(req, res, next) {
  try {
    const { reportId } = req.validated.params;
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "NotFound", message: "Report not found" });

    const patient = await Patient.findById(report.patientId);
    if (!patient) return res.status(404).json({ error: "NotFound", message: "Patient not found" });

    if (!canAccessPatient(req.user, patient)) {
      return res.status(403).json({ error: "Forbidden", message: "Cannot delete this report" });
    }

    const uploadDir = process.env.UPLOAD_DIR || "uploads";
    const fileName = String(report.fileURL || "").replace(/^\/uploads\//, "");
    const filePath = path.resolve(uploadDir, fileName);

    await Report.deleteOne({ _id: report._id });

    // Best-effort file deletion (ignore if missing)
    try {
      if (fileName) await fs.unlink(filePath);
    } catch {
      /* ignore */
    }

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}


import { z } from "zod";
import crypto from "crypto";
import { User } from "../models/User.js";
import { Patient } from "../models/Patient.js";
import { ROLES } from "../config/constants.js";
import { signAccessToken } from "../utils/tokens.js";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    password: z.string().min(8).max(200),
    role: z.enum([ROLES.DOCTOR, ROLES.PATIENT]),
    patientProfile: z
      .object({
        aadhaarNumber: z.string().regex(/^\d{12}$/),
        age: z.number().int().min(0).max(130).optional(),
        gender: z.string().max(30).optional()
      })
      .optional()
  })
});

export async function register(req, res, next) {
  try {
    const { name, email, password, role, patientProfile } = req.validated.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Conflict", message: "Email already in use" });

    const user = await User.create({ name, email, password, role });

    if (role === ROLES.PATIENT) {
      if (!patientProfile?.aadhaarNumber) {
        return res.status(400).json({
          error: "ValidationError",
          message: "patientProfile.aadhaarNumber is required for patient role"
        });
      }

      const patient = await Patient.create({
        userId: user._id,
        name,
        aadhaarNumber: patientProfile.aadhaarNumber,
        age: patientProfile.age,
        gender: patientProfile.gender
      });

      const token = signAccessToken(user);
      return res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        patient: { id: patient._id, aadhaarNumber: patient.aadhaarNumber }
      });
    }

    const token = signAccessToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Conflict", message: "Duplicate key" });
    }
    return next(err);
  }
}

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });

    const token = signAccessToken(user);

    let patient = null;
    if (user.role === ROLES.PATIENT) {
      patient = await Patient.findOne({ userId: user._id });
    }

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      patient: patient ? { id: patient._id, aadhaarNumber: patient.aadhaarNumber } : null
    });
  } catch (err) {
    return next(err);
  }
}

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

// Demo-friendly: returns a reset token in the response (no email sending).
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.validated.body;
    const user = await User.findOne({ email });

    // Always return success to avoid email enumeration
    if (!user) return res.json({ ok: true });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    return res.json({
      ok: true,
      resetToken: token,
      expiresInMinutes: 30
    });
  } catch (err) {
    return next(err);
  }
}

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    newPassword: z.string().min(8).max(200)
  })
});

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.validated.body;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "BadRequest", message: "Invalid or expired reset token" });
    }

    user.password = newPassword;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}


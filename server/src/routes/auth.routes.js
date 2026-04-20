import { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  forgotPassword,
  forgotPasswordSchema,
  login,
  loginSchema,
  register,
  registerSchema,
  resetPassword,
  resetPasswordSchema
} from "../controllers/auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
authRoutes.post("/reset-password", validate(resetPasswordSchema), resetPassword);


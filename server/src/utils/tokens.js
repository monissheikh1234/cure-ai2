import jwt from "jsonwebtoken";

export function signAccessToken(user) {
  const payload = { sub: String(user._id), role: user.role, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}


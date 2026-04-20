import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/api.js";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // "No more security for now": we hide the token step and do it automatically.
      const fp = await forgotPassword(email);
      if (!fp?.resetToken) {
        // backend hides existence for unknown emails; keep it user-friendly
        setSuccess("If the account exists, password has been reset. Please try logging in.");
        return;
      }
      await resetPassword({ token: fp.resetToken, newPassword });
      setSuccess("Password reset successful. You can now log in.");
      setTimeout(() => navigate("/login"), 600);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card-glass p-6 mt-8">
      <h2 className="text-xl font-semibold mb-1">Reset Password</h2>
      <p className="text-xs text-slate-400 mb-4">
        Enter your email and a new password. For this demo, the reset is performed immediately.
      </p>

      {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
      {success && <div className="mb-3 text-sm text-emerald-400">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs mb-1 text-slate-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs mb-1 text-slate-300">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="mt-1 text-[11px] text-slate-400">Minimum 8 characters.</p>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <div className="mt-4 text-xs text-slate-400">
        <Link to="/login" className="text-brand-400 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}


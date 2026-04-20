import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { login as apiLogin } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.jsx";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to={user.role === "doctor" ? "/doctor" : "/patient"} replace />;
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiLogin(form);
      login(data);
      navigate(data.user.role === "doctor" ? "/doctor" : "/patient", { replace: true });
    } catch (err) {
      const details = err?.response?.data
        ? JSON.stringify(err.response.data)
        : err?.message || "Unknown error";
      setError(details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card-glass p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs mb-1 text-slate-300">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs mb-1 text-slate-300">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <Link to="/reset-password" className="text-brand-400 hover:underline">
          Reset password
        </Link>
        <Link to="/register" className="hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}


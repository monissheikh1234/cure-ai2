import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { register as apiRegister } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.jsx";

export function RegisterPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    aadhaarNumber: "",
    age: "",
    gender: ""
  });
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
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      };
      if (form.role === "patient") {
        payload.patientProfile = {
          aadhaarNumber: form.aadhaarNumber,
          age: form.age ? Number(form.age) : undefined,
          gender: form.gender || undefined
        };
      }
      const data = await apiRegister(payload);
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
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1 text-slate-300">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-slate-300">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        </div>
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
            minLength={8}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {form.role === "patient" && (
          <>
            <div>
              <label className="block text-xs mb-1 text-slate-300">Aadhaar Number</label>
              <input
                name="aadhaarNumber"
                value={form.aadhaarNumber}
                onChange={handleChange}
                required
                pattern="\d{12}"
                maxLength={12}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">Exactly 12 digits.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1 text-slate-300">Age</label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  min={0}
                  max={130}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-300">Gender</label>
                <input
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}


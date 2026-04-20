import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { getRecentPatients } from "../utils/recentPatients.js";

export function DoctorDashboard() {
  const { user } = useAuth();
  const [recentPatients, setRecentPatients] = useState([]);
  const [info] = useState({
    totalPatients: "—",
    recentActivity: ["Seed data includes one demo patient with asthma affecting the lungs."]
  });

  useEffect(() => {
    setRecentPatients(getRecentPatients());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Doctor Dashboard</h2>
        <p className="text-sm text-slate-300">
          Welcome, {user?.name}. Use Aadhaar search to open a patient record, upload reports, and
          view 3D organ highlights based on diagnoses.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-glass p-4">
          <div className="text-xs text-slate-400">Patients (demo)</div>
          <div className="text-2xl font-semibold mt-1">{info.totalPatients}</div>
          <p className="text-xs text-slate-400 mt-2">
            Use the Aadhaar search page to retrieve specific patients.
          </p>
        </div>
        <div className="card-glass p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400 mb-1">Core tools</div>
            <ul className="text-sm space-y-1 text-brand-400">
              <li>
                <Link to="/search" className="hover:underline">
                  Search patient by Aadhaar
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:underline">
                  Upload medical report
                </Link>
              </li>
              <li>
                <Link to="/visualization" className="hover:underline">
                  3D health visualization
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="card-glass p-4">
          <div className="text-xs text-slate-400 mb-2">Recent searched patients</div>
          {recentPatients.length === 0 ? (
            <div className="text-xs text-slate-500">
              No recent patients yet. Search by Aadhaar to add them here.
            </div>
          ) : (
            <ul className="text-xs text-slate-300 space-y-2">
              {recentPatients.map((p) => (
                <li key={p._id} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-slate-200">{p.name}</div>
                    <div className="text-slate-400 font-mono">{p.aadhaarNumber}</div>
                  </div>
                  <Link to={`/doctor/patient/${p._id}`} className="btn-ghost">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 border-t border-slate-800 pt-3">
            <div className="text-xs text-slate-400 mb-1">Recent activity (demo)</div>
            <ul className="text-xs text-slate-300 space-y-1">
              {info.recentActivity.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


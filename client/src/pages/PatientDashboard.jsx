import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { deleteReport, getMyPatientProfile, getReportsByPatient } from "../services/api.js";

export function PatientDashboard() {
  const { user, patient } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const p = await getMyPatientProfile();
        setProfile(p);
        const rep = await getReportsByPatient(p._id);
        setReports(rep);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      }
    }
    if (user?.role === "patient") {
      load();
    }
  }, [user]);

  const handleDelete = async (reportId) => {
    const ok = window.confirm("Delete this report? This cannot be undone.");
    if (!ok) return;
    setDeletingId(reportId);
    setError("");
    try {
      await deleteReport(reportId);
      setReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  if (user?.role !== "patient") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Patient Dashboard</h2>
        <p className="text-sm text-slate-300">
          Hello, {user.name}. Review your medical history, prescriptions and AI-analyzed reports.
        </p>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-glass p-4 space-y-1">
          <div className="text-xs text-slate-400">Profile</div>
          <div className="text-sm">
            <div>Name: {profile?.name}</div>
            <div>Aadhaar: {profile?.aadhaarNumber}</div>
            <div>Age: {profile?.age ?? "—"}</div>
            <div>Gender: {profile?.gender || "—"}</div>
          </div>
        </div>
        <div className="card-glass p-4 space-y-1">
          <div className="text-xs text-slate-400">Diseases</div>
          <ul className="text-sm list-disc pl-5">
            {profile?.diseases?.length
              ? profile.diseases.map((d) => (
                  <li key={d.name + d.organ}>
                    {d.name}
                    {d.organ && <span className="text-slate-400"> · {d.organ}</span>}
                  </li>
                ))
              : <li>No diseases recorded.</li>}
          </ul>
        </div>
        <div className="card-glass p-4 space-y-1">
          <div className="text-xs text-slate-400">Medications</div>
          <ul className="text-sm list-disc pl-5">
            {profile?.medications?.length
              ? profile.medications.map((m, i) => (
                  <li key={i}>
                    {m.name}
                    {m.dosage && ` · ${m.dosage}`}
                    {m.frequency && ` · ${m.frequency}`}
                  </li>
                ))
              : <li>No medications recorded.</li>}
          </ul>
        </div>
      </div>

      <div className="card-glass p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-slate-400">Medical reports</div>
        </div>
        {reports.length === 0 ? (
          <div className="text-sm text-slate-400">No reports uploaded yet.</div>
        ) : (
          <div className="space-y-3 text-sm">
            {reports.map((r) => (
              <div key={r._id} className="border border-slate-800 rounded-lg p-3">
                <div className="flex justify-between">
                  <div className="font-medium">{r.originalName}</div>
                  <div className="flex items-center gap-3">
                    <a
                      href={r.fileURL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-400 hover:underline"
                    >
                      View file
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(r._id)}
                      disabled={deletingId === r._id}
                      className="text-xs text-red-300 hover:text-red-200 disabled:opacity-50"
                    >
                      {deletingId === r._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
                {r.summary && (
                  <div className="mt-2">
                    <div className="text-xs text-slate-400">AI Summary</div>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap">
                      {r.summary}
                    </p>
                  </div>
                )}
                {r.explanation && (
                  <div className="mt-2">
                    <div className="text-xs text-slate-400">Explanation</div>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap">
                      {r.explanation}
                    </p>
                  </div>
                )}
                {r.recommendations && (
                  <div className="mt-2">
                    <div className="text-xs text-slate-400">Recommendations</div>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap">
                      {r.recommendations}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


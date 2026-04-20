import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { getMyPatientProfile, searchPatientByAadhaar, uploadReport } from "../services/api.js";
import { addRecentPatient, getRecentPatients } from "../utils/recentPatients.js";

export function UploadReportPage() {
  const { user, patient } = useAuth();
  const location = useLocation();
  const [patientId, setPatientId] = useState(patient?.id || "");
  const [aadhaar, setAadhaar] = useState("");
  const [patientPreview, setPatientPreview] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [aiInfo, setAiInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const queryPatientId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("patientId") || "";
  }, [location.search]);

  useEffect(() => {
    async function load() {
      if (user?.role === "patient" && !patientId) {
        try {
          const p = await getMyPatientProfile();
          setPatientId(p._id);
        } catch {
          /* ignore */
        }
      }
    }
    load();
  }, [user, patientId]);

  useEffect(() => {
    if (user?.role === "doctor") {
      setRecentPatients(getRecentPatients());
      if (queryPatientId) setPatientId(queryPatientId);
    }
  }, [user, queryPatientId]);

  const handleAadhaarLookup = async () => {
    setError("");
    setMessage("");
    setAiInfo("");
    setPatientPreview(null);

    if (!/^\d{12}$/.test(aadhaar)) {
      setError("Aadhaar must be exactly 12 digits.");
      return;
    }

    try {
      const { patient: p } = await searchPatientByAadhaar(aadhaar);
      setPatientId(p._id);
      setPatientPreview(p);
      setRecentPatients(addRecentPatient(p) || getRecentPatients());
    } catch (err) {
      setError(err.response?.data?.message || "Patient lookup failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setAiInfo("");
    if (!patientId || !file) {
      setError("Select a patient and a file.");
      return;
    }
    setLoading(true);
    try {
      const { aiStatus, aiError } = await uploadReport({ patientId, file });
      setMessage("Report uploaded successfully.");
      if (aiStatus === "success") {
        setAiInfo("AI summary generated successfully. Check the dashboard to view it.");
      } else if (aiStatus === "no_text") {
        setAiInfo("Upload succeeded, but no readable text was found in the document for AI analysis.");
      } else if (aiStatus === "failed") {
        setAiInfo(`Upload succeeded, but AI analysis failed: ${aiError || "unknown error"}.`);
      }
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Upload Medical Report</h2>
        <p className="text-sm text-slate-300">
          Upload Word (.docx) medical reports. The backend extracts document text and requests
          Gemini to generate summaries and explanations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-glass p-4 space-y-4 max-w-lg">
        {user?.role === "doctor" && (
          <>
            <div className="grid gap-2">
              <div className="text-xs text-slate-400">Select patient</div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-2">
                <input
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  placeholder="Search by Aadhaar (12 digits)"
                  maxLength={12}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button type="button" className="btn-ghost" onClick={handleAadhaarLookup}>
                  Search
                </button>
              </div>

              {recentPatients.length > 0 && (
                <div className="grid gap-1">
                  <div className="text-[11px] text-slate-500">Recent</div>
                  <select
                    value={patientId}
                    onChange={(e) => {
                      setPatientId(e.target.value);
                      const found = recentPatients.find((p) => p._id === e.target.value);
                      setPatientPreview(found || null);
                    }}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select a patient…</option>
                    {recentPatients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} · {p.aadhaarNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="text-[11px] text-slate-500">
                Current patientId: <span className="font-mono">{patientId || "—"}</span>
              </div>

              {patientPreview && (
                <div className="text-xs text-slate-300 border border-slate-800 rounded-lg p-3">
                  <div className="font-medium text-slate-200">{patientPreview.name}</div>
                  <div className="text-slate-400 font-mono">{patientPreview.aadhaarNumber}</div>
                  <div className="text-slate-400">
                    {patientPreview.age ?? "—"} · {patientPreview.gender || "—"}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {user?.role === "patient" && (
          <div className="text-xs text-slate-400">
            Uploading on behalf of your own patient profile.
          </div>
        )}

        <div>
          <label className="block text-xs mb-1 text-slate-300">Report file (Word)</label>
          <input
            type="file"
            accept=".docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Max 10MB. Supported: Microsoft Word (.docx) only.
          </p>
        </div>

        {message && <div className="text-sm text-emerald-400">{message}</div>}
        {aiInfo && <div className="text-xs text-slate-300">{aiInfo}</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Uploading..." : "Upload report"}
        </button>
      </form>
    </div>
  );
}


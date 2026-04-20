import { useState } from "react";
import { Link } from "react-router-dom";
import { searchPatientByAadhaar, getReportsByPatient } from "../services/api.js";
import { addRecentPatient } from "../utils/recentPatients.js";

export function SearchPatientPage() {
  const [aadhaar, setAadhaar] = useState("");
  const [error, setError] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPatientData(null);
    setReports([]);

    if (!/^\d{12}$/.test(aadhaar)) {
      setError("Aadhaar must be exactly 12 digits.");
      return;
    }

    setLoading(true);
    try {
      const { patient, user } = await searchPatientByAadhaar(aadhaar);
      setPatientData({ patient, user });
      addRecentPatient(patient);
      const rep = await getReportsByPatient(patient._id);
      setReports(rep);
    } catch (err) {
      setError(err.response?.data?.message || "Patient lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Search Patient by Aadhaar</h2>
        <p className="text-sm text-slate-300">
          Enter a 12 digit Aadhaar number to retrieve patient demographics, diseases, medications
          and associated reports.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-glass p-4 flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs mb-1 text-slate-300">Aadhaar Number</label>
          <input
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            maxLength={12}
            pattern="\d{12}"
            required
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="mt-1 text-[11px] text-slate-400">Exactly 12 digits.</p>
        </div>
        <button type="submit" className="btn-primary w-full md:w-auto" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="text-sm text-red-400">{error}</div>}

      {patientData && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link to={`/doctor/patient/${patientData.patient._id}`} className="btn-ghost">
              Open patient record
            </Link>
            <Link to={`/upload?patientId=${patientData.patient._id}`} className="btn-primary">
              Upload report for this patient
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card-glass p-4 space-y-1">
              <div className="text-xs text-slate-400">Patient</div>
              <div className="text-sm">
                <div>Name: {patientData.patient.name}</div>
                <div>Aadhaar: {patientData.patient.aadhaarNumber}</div>
                <div>Age: {patientData.patient.age ?? "—"}</div>
                <div>Gender: {patientData.patient.gender || "—"}</div>
              </div>
            </div>
            <div className="card-glass p-4 space-y-1">
              <div className="text-xs text-slate-400">Diseases</div>
              <ul className="text-sm list-disc pl-5">
                {patientData.patient.diseases?.length
                  ? patientData.patient.diseases.map((d) => (
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
                {patientData.patient.medications?.length
                  ? patientData.patient.medications.map((m, i) => (
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
            <div className="text-xs text-slate-400 mb-2">Reports</div>
            {reports.length === 0 ? (
              <div className="text-sm text-slate-400">No reports uploaded for this patient.</div>
            ) : (
              <div className="space-y-3 text-sm">
                {reports.map((r) => (
                  <div key={r._id} className="border border-slate-800 rounded-lg p-3">
                    <div className="flex justify-between">
                      <div className="font-medium">{r.originalName}</div>
                      <a
                        href={r.fileURL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-brand-400 hover:underline"
                      >
                        View file
                      </a>
                    </div>
                    {r.summary && (
                      <div className="mt-2">
                        <div className="text-xs text-slate-400">AI Summary</div>
                        <p className="text-xs text-slate-200 whitespace-pre-wrap">
                          {r.summary}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


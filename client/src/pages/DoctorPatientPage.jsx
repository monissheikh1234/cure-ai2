import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPatientById, getReportsByPatient, updatePatient } from "../services/api.js";
import { HumanBodyViewer } from "../components/HumanBodyViewer.jsx";

export function DoctorPatientPage() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [diseaseDraft, setDiseaseDraft] = useState({ name: "", organ: "heart", notes: "" });
  const [medDraft, setMedDraft] = useState({ name: "", dosage: "", frequency: "", duration: "" });

  useEffect(() => {
    async function load() {
      setError("");
      try {
        const data = await getPatientById(patientId);
        setPatient(data.patient);

        const rep = await getReportsByPatient(patientId);
        setReports(rep);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load patient record");
      }
    }
    load();
  }, [patientId]);

  // Minimal UI: show reports + quick actions + editor that uses PATCH endpoint
  const handleAddDisease = async () => {
    if (!diseaseDraft.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const nextDiseases = [...(patient?.diseases || []), { ...diseaseDraft }];
      const updated = await updatePatient(patientId, { diseases: nextDiseases });
      setPatient(updated);
      setDiseaseDraft({ name: "", organ: "heart", notes: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update diseases");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMedication = async () => {
    if (!medDraft.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const nextMeds = [...(patient?.medications || []), { ...medDraft }];
      const updated = await updatePatient(patientId, { medications: nextMeds });
      setPatient(updated);
      setMedDraft({ name: "", dosage: "", frequency: "", duration: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update medications");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Patient Record</h2>
          <p className="text-sm text-slate-300">
            Patient ID: <span className="font-mono text-xs">{patientId}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/upload?patientId=${patientId}`} className="btn-primary">
            Upload report
          </Link>
          <Link to="/search" className="btn-ghost">
            Back to search
          </Link>
        </div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-glass p-4 space-y-2 lg:col-span-2">
          <div className="text-xs text-slate-400">3D Health Visualization</div>
          <HumanBodyViewer diseases={patient?.diseases || []} heightClass="h-[520px]" />
          <div className="text-xs text-slate-400">
            Highlighted organs are based on the patient’s recorded diseases.
          </div>
        </div>

        <div className="card-glass p-4 space-y-3">
          <div className="text-xs text-slate-400">Diseases (doctor editable)</div>
          <ul className="text-sm list-disc pl-5">
            {patient?.diseases?.length ? (
              patient.diseases.map((d, i) => (
                <li key={i}>
                  {d.name} {d.organ ? <span className="text-slate-400">· {d.organ}</span> : null}
                </li>
              ))
            ) : (
              <li>No diseases recorded.</li>
            )}
          </ul>

          <div className="border-t border-slate-800 pt-3 grid gap-2">
            <div className="text-xs text-slate-400">Add disease</div>
            <input
              value={diseaseDraft.name}
              onChange={(e) => setDiseaseDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Mild coronary artery disease"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={diseaseDraft.organ}
                onChange={(e) => setDiseaseDraft((d) => ({ ...d, organ: e.target.value }))}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="heart">heart</option>
                <option value="lungs">lungs</option>
                <option value="liver">liver</option>
                <option value="kidneys">kidneys</option>
                <option value="pancreas">pancreas</option>
              </select>
              <button className="btn-primary" type="button" disabled={saving} onClick={handleAddDisease}>
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="card-glass p-4 space-y-3">
          <div className="text-xs text-slate-400">Medications (doctor editable)</div>
          <ul className="text-sm list-disc pl-5">
            {patient?.medications?.length ? (
              patient.medications.map((m, i) => (
                <li key={i}>
                  {m.name}
                  {m.dosage ? <span className="text-slate-400"> · {m.dosage}</span> : null}
                  {m.frequency ? <span className="text-slate-400"> · {m.frequency}</span> : null}
                </li>
              ))
            ) : (
              <li>No medications recorded.</li>
            )}
          </ul>

          <div className="border-t border-slate-800 pt-3 grid gap-2">
            <div className="text-xs text-slate-400">Add medication</div>
            <input
              value={medDraft.name}
              onChange={(e) => setMedDraft((m) => ({ ...m, name: e.target.value }))}
              placeholder="e.g. Atorvastatin 10mg"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={medDraft.dosage}
                onChange={(e) => setMedDraft((m) => ({ ...m, dosage: e.target.value }))}
                placeholder="Dosage"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                value={medDraft.frequency}
                onChange={(e) => setMedDraft((m) => ({ ...m, frequency: e.target.value }))}
                placeholder="Frequency"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button className="btn-primary" type="button" disabled={saving} onClick={handleAddMedication}>
              Add medication
            </button>
          </div>
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
                    <p className="text-xs text-slate-200 whitespace-pre-wrap">{r.summary}</p>
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


import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { getMyPatientProfile } from "../services/api.js";
import { ThreeDViewer } from "../components/ThreeDViewer.jsx";

export function VisualizationPage() {
  const { user } = useAuth();
  const [diseases, setDiseases] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (user?.role === "patient") {
          const p = await getMyPatientProfile();
          setDiseases(p.diseases || []);
        } else {
          setDiseases([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load patient diseases");
      }
    }
    load();
  }, [user]);

  const highlightedOrgans = useMemo(() => {
    const organs = new Set();
    diseases.forEach((d) => {
      if (d.organ) organs.add(d.organ.toLowerCase());
      const name = d.name.toLowerCase();
      if (name.includes("heart") || name.includes("cardiac")) organs.add("heart");
      if (name.includes("lung") || name.includes("pneumonia") || name.includes("asthma")) organs.add("lungs");
      if (name.includes("liver") || name.includes("hepatitis")) organs.add("liver");
      if (name.includes("kidney") || name.includes("renal")) organs.add("kidneys");
      if (name.includes("diabetes")) organs.add("pancreas");
    });
    return Array.from(organs);
  }, [diseases]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold mb-1">3D Health Visualization</h2>
        <p className="text-sm text-slate-300">
          This simplified 3D body highlights organs associated with diseases recorded in the
          patient profile.
        </p>
      </div>

      <ThreeDViewer highlightedOrgans={highlightedOrgans} />

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="card-glass p-4 text-sm">
        <div className="text-xs text-slate-400 mb-1">Legend</div>
        <ul className="list-disc pl-5 space-y-1 text-slate-200">
          <li>Heart disease → heart glow</li>
          <li>Lung infections/asthma → lungs glow</li>
          <li>Liver disease → liver glow</li>
          <li>Kidney disease → kidneys glow</li>
          <li>Diabetes → pancreas glow</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          This visualization is for educational purposes only and does not replace clinical
          imaging.
        </p>
      </div>
    </div>
  );
}


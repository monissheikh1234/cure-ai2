import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { getMyPatientProfile } from "../services/api.js";
import { HumanBodyViewer } from "../components/HumanBodyViewer.jsx";

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (user?.role === "patient") {
        try {
          const p = await getMyPatientProfile();
          setProfile(p);
        } catch (err) {
          setError(err.response?.data?.message || "Failed to load profile");
        }
      }
    }
    load();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Profile</h2>
        <p className="text-sm text-slate-300">
          Basic account information and, for patients, linked medical profile.
        </p>
      </div>

      <div className="card-glass p-4 space-y-1 text-sm max-w-lg">
        <div className="text-xs text-slate-400">Account</div>
        <div>Name: {user.name}</div>
        <div>Email: {user.email}</div>
        <div>Role: {user.role}</div>
      </div>

      {user.role === "patient" && (
        <>
          <div className="card-glass p-4 space-y-1 text-sm max-w-lg">
            <div className="text-xs text-slate-400">Patient profile</div>
            {error && <div className="text-xs text-red-400">{error}</div>}
            {profile ? (
              <>
                <div>Aadhaar: {profile.aadhaarNumber}</div>
                <div>Age: {profile.age ?? "—"}</div>
                <div>Gender: {profile.gender || "—"}</div>
              </>
            ) : (
              <div className="text-xs text-slate-400">No patient profile found.</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">3D Health Visualization</div>
            <p className="text-xs text-slate-400">
              Highlighted organs are based on your recorded diseases. Disease names are listed below.
            </p>
            <HumanBodyViewer diseases={profile?.diseases || []} />
            <div className="card-glass p-4 text-sm">
              <div className="text-xs text-slate-400 mb-2">Recorded diseases</div>
              {profile?.diseases?.length ? (
                <ul className="list-disc pl-5 space-y-1">
                  {profile.diseases.map((d, i) => (
                    <li key={i}>
                      {d.name}
                      {d.organ ? <span className="text-slate-400"> · {d.organ}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-500">No diseases recorded.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


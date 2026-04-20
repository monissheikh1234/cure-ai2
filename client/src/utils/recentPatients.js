const KEY = "cureai_recent_patients";

export function getRecentPatients() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentPatient(patient) {
  if (!patient?._id) return;
  const item = {
    _id: patient._id,
    name: patient.name,
    aadhaarNumber: patient.aadhaarNumber,
    age: patient.age ?? null,
    gender: patient.gender ?? null,
    updatedAt: Date.now()
  };

  const existing = getRecentPatients().filter((p) => p._id !== item._id);
  const next = [item, ...existing].slice(0, 8);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}


import axios from "axios";

// Use a fixed base URL to avoid env mismatches during local development.
// Backend is configured to run on http://localhost:5050
const api = axios.create({
  baseURL: "http://localhost:5050"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cureai_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(payload) {
  const res = await api.post("/auth/login", payload);
  return res.data;
}

export async function register(payload) {
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function forgotPassword(email) {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data; // { ok, resetToken?, expiresInMinutes? }
}

export async function resetPassword({ token, newPassword }) {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return res.data; // { ok }
}

export async function getMyPatientProfile() {
  const res = await api.get("/api/patient/me");
  return res.data.patient;
}

export async function searchPatientByAadhaar(aadhaarNumber) {
  const res = await api.get(`/api/patient/aadhaar/${aadhaarNumber}`);
  return res.data;
}

export async function getPatientById(patientId) {
  const res = await api.get(`/api/patient/${patientId}`);
  return res.data;
}

export async function updatePatient(patientId, payload) {
  const res = await api.patch(`/api/patient/${patientId}`, payload);
  return res.data.patient;
}

export async function uploadReport({ patientId, file }) {
  const formData = new FormData();
  formData.append("patientId", patientId);
  formData.append("file", file);
  const res = await api.post("/api/reports/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data; // { report, aiStatus, aiError }
}

export async function getReportsByPatient(patientId) {
  const res = await api.get(`/api/reports/patient/${patientId}`);
  return res.data.reports;
}

export async function analyzeReport(reportId) {
  const res = await api.post(`/api/reports/${reportId}/analyze`);
  return res.data.report;
}

export async function deleteReport(reportId) {
  const res = await api.delete(`/api/reports/${reportId}`);
  return res.data; // { ok: true }
}

export default api;


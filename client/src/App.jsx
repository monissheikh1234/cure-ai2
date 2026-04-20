import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/Layout.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { DoctorDashboard } from "./pages/DoctorDashboard.jsx";
import { PatientDashboard } from "./pages/PatientDashboard.jsx";
import { SearchPatientPage } from "./pages/SearchPatientPage.jsx";
import { UploadReportPage } from "./pages/UploadReportPage.jsx";
import { VisualizationPage } from "./pages/VisualizationPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { DoctorPatientPage } from "./pages/DoctorPatientPage.jsx";
import { ResetPasswordPage } from "./pages/ResetPasswordPage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";

export default function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient"
            element={
              <ProtectedRoute roles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <SearchPatientPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute roles={["doctor", "patient"]}>
                <UploadReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patient/:patientId"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <DoctorPatientPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visualization"
            element={
              <ProtectedRoute roles={["patient", "doctor"]}>
                <VisualizationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["patient", "doctor"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>
    </AuthProvider>
  );
}


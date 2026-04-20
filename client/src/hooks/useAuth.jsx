import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("cureai_user");
    const storedPatient = localStorage.getItem("cureai_patient");
    if (stored) setUser(JSON.parse(stored));
    if (storedPatient) setPatient(JSON.parse(storedPatient));
    setLoading(false);
  }, []);

  const login = (payload) => {
    localStorage.setItem("cureai_token", payload.token);
    localStorage.setItem("cureai_user", JSON.stringify(payload.user));
    if (payload.patient) {
      localStorage.setItem("cureai_patient", JSON.stringify(payload.patient));
    } else {
      localStorage.removeItem("cureai_patient");
    }
    setUser(payload.user);
    setPatient(payload.patient ?? null);
  };

  const logout = () => {
    localStorage.removeItem("cureai_token");
    localStorage.removeItem("cureai_user");
    localStorage.removeItem("cureai_patient");
    setUser(null);
    setPatient(null);
  };

  const value = { user, patient, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


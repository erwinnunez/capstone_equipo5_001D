import { useState, useEffect } from "react";
import { AuthProvider } from "./state/auth";
import { LoginPage } from "./components/LoginPage";
import AdminDashboard from "./components/administrador/AdminDashboard";
import CaregiverDashboard from "./components/cuidador/CaregiverDashboard";
import PatientDashboard from "./components/paciente/PatientDashboard";
import { DoctorDashboard } from "./components/doctor/DoctorDashboard";

// Tipos de UI (camelCase preferido en front)
type Role = "admin" | "doctor" | "caregiver" | "patient";

export interface FrontUserUI {
  id: string;
  name: string;
  role: Role;
  email: string;
  // ambos por compatibilidad; usamos rutPaciente en la UI
  rut_paciente?: number;  // llega desde el backend
  rutPaciente?: number;   // usamos en componentes
}

interface AuthState {
  user: FrontUserUI;
  token?: string | null;
}

function AppInner() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  // (Opcional) Restaurar sesión
  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const parsed: AuthState = JSON.parse(raw);
        setAuth(parsed);
      } catch {}
    }
  }, []);

  // Normaliza el usuario que llega del login
  const handleLogin = (payload: any) => {
    const rawUser = payload?.user ?? payload;
    // mapeo único: rut_paciente -> rutPaciente
    const user: FrontUserUI = {
      ...rawUser,
      rutPaciente: rawUser.rutPaciente ?? rawUser.rut_paciente, // preferir camelCase en UI
    };
    const next: AuthState = { user, token: payload?.token ?? null };
    setAuth(next);
    // (Opcional) Persistir
    localStorage.setItem("auth", JSON.stringify(next));
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  if (!auth) return <LoginPage onLogin={handleLogin} />;

  const user = auth.user;

  switch (user.role) {
    case "admin":
      return <AdminDashboard user={user} onLogout={handleLogout} />;

    case "doctor":
      return <DoctorDashboard user={user} onLogout={handleLogout} />;

    case "caregiver":
      return <CaregiverDashboard user={user} onLogout={handleLogout} />;

    case "patient":
      // user.rutPaciente ya viene seteado por el mapeo de arriba
      return (
        <PatientDashboard
          user={user}
          onLogout={handleLogout}
        />
      );

    default:
      return <LoginPage onLogin={handleLogin} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

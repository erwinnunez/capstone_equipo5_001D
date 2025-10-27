// src/components/LoginPage.tsx
import { useState } from "react";
import { Activity, Shield, Stethoscope, Heart, User } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { login as doLogin, type FrontUser } from "../services/auth";

// Reusables
import RegisterPatientPage from "../components/paciente/RegisterPatientPage";      // ajusta la ruta si difiere
import RegisterCaregiverPage from "../components/cuidador/RegisterCaregiverPage"; // ajusta la ruta si difiere

type Role = FrontUser["role"];

interface LoginPageProps {
  onLogin: (auth: { user: FrontUser; token?: string }) => void;
}
type LoginResult = FrontUser | { user: FrontUser; token?: string };

export function LoginPage({ onLogin }: LoginPageProps) {
  // ----------- Login -----------
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ----------- Modales de registro -----------
  const [selectRoleOpen, setSelectRoleOpen] = useState<boolean>(false);
  const [registerRole, setRegisterRole] = useState<"" | "patient" | "caregiver">("");
  const [patientModalOpen, setPatientModalOpen] = useState<boolean>(false);
  const [caregiverModalOpen, setCaregiverModalOpen] = useState<boolean>(false);

  /* =================== LOGIN =================== */
  const roles = [
    { value: "admin", label: "Administrador", icon: Shield, description: "Gestión y auditoría de sistemas" },
    { value: "doctor", label: "Doctor", icon: Stethoscope, description: "Monitoreo y reportes de pacientes" },
    { value: "caregiver", label: "Cuidador", icon: Heart, description: "Entrada y atención de datos de pacientes" },
    { value: "patient", label: "Paciente", icon: User, description: "Autocontrol y progreso" },
  ] as const;

  const handleLogin = async () => {
    setErrorMsg("");
    if (!selectedRole || !email || !password) {
      setErrorMsg("Completa email, contraseña y rol.");
      return;
    }
    try {
      setLoading(true);
      const res = (await doLogin(email, password, selectedRole as Role)) as LoginResult;
      if ("user" in res) onLogin({ user: res.user, token: res.token });
      else onLogin({ user: res });
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  /* =================== REGISTRO: selección de rol =================== */
  const openRegisterSelect = () => {
    setRegisterRole("");
    setSelectRoleOpen(true);
  };
  const continueRegister = () => {
    if (registerRole === "patient") {
      setPatientModalOpen(true);
      setSelectRoleOpen(false);
    } else if (registerRole === "caregiver") {
      setCaregiverModalOpen(true);
      setSelectRoleOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Activity className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-semibold text-gray-900">CuidaSalud</h1>
          </div>
          <p className="text-lg text-gray-600">Sistema de monitoreo de pacientes</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* ----------- Card Login ----------- */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Iniciar sesión</CardTitle>
              <CardDescription>Acceda a su panel de control de seguimiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ingresar su email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresar su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={selectedRole} onValueChange={(v: string) => setSelectedRole(v as Role)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccionar su rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center">
                          <role.icon className="h-4 w-4 mr-2" />
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

              <Button onClick={handleLogin} className="w-full" disabled={!email || !password || !selectedRole || loading}>
                {loading ? "Validando…" : "Iniciar sesión"}
              </Button>

              <Button variant="outline" className="w-full" onClick={openRegisterSelect}>
                Crear cuenta
              </Button>
            </CardContent>
          </Card>

          {/* ----------- Card Usuarios Demo ----------- */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Usuarios demo</CardTitle>
              <CardDescription>Explorar los diferentes usuarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((role) => (
                <Button
                  key={role.value}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() =>
                    onLogin({
                      user: {
                        id: `${role.value}-demo`,
                        name: `Demo ${role.label}`,
                        role: role.value as Role,
                        email: `demo@${role.value}.com`,
                        rut_paciente: role.value === "patient" ? 12345678 : undefined,
                      },
                    })
                  }
                >
                  <role.icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                    {role.value === "patient" && (
                      <div className="text-xs text-gray-500 mt-1">(Demo usa RUT 12345678)</div>
                    )}
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL: Selección de rol */}
      <Dialog open={selectRoleOpen} onOpenChange={setSelectRoleOpen}>
        <DialogContent className="sm:w-md">
          <DialogHeader>
            <DialogTitle>Crear cuenta</DialogTitle>
            <DialogDescription>Elige el tipo de cuenta que deseas crear</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Tipo de usuario</Label>
            <Select value={registerRole} onValueChange={(v: string) => setRegisterRole(v as "patient" | "caregiver")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Paciente</SelectItem>
                <SelectItem value="caregiver">Cuidador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectRoleOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={continueRegister} disabled={!registerRole}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Registro Paciente (reusado) */}
      <Dialog open={patientModalOpen} onOpenChange={setPatientModalOpen}>
        <DialogContent
          style={{ width: "96vw", maxWidth: "1000px", height: "85vh" }}
          className="overflow-hidden rounded-2xl p-0 flex flex-col"
        >
          <div className="px-6 pt-6 pb-3 border-b">
            <DialogHeader>
              <DialogTitle>Registrar paciente</DialogTitle>
              <DialogDescription>Completa los datos requeridos por la API</DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <RegisterPatientPage
              onCancel={() => setPatientModalOpen(false)}
              onSuccess={() => setPatientModalOpen(false)}
            />
          </div>

          <div className="px-6 pb-6 pt-3 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPatientModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Registro Cuidador (reusado) */}
      <Dialog open={caregiverModalOpen} onOpenChange={setCaregiverModalOpen}>
        <DialogContent
          style={{ width: "96vw", maxWidth: "900px", height: "80vh" }}
          className="overflow-hidden rounded-2xl p-0 flex flex-col"
        >
          <div className="px-6 pt-6 pb-3 border-b">
            <DialogHeader>
              <DialogTitle>Registrar cuidador</DialogTitle>
              <DialogDescription>Completa los datos requeridos por la API</DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <RegisterCaregiverPage
              onCancel={() => setCaregiverModalOpen(false)}
              onSuccess={() => setCaregiverModalOpen(false)}
            />
          </div>

          <div className="px-6 pb-6 pt-3 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCaregiverModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

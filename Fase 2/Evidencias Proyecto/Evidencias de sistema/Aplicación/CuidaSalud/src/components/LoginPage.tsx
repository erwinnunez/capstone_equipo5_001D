// src/components/LoginPage.tsx
import { useEffect, useMemo, useState } from "react";
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

// Services de registro
import {
  createPaciente,
  type PacienteCreatePayload,
  toNiceMessage as nicePacMsg,
} from "../services/paciente";
import {
  createCuidador,
  type CuidadorCreatePayload,
  toNiceMessage as niceCuiMsg,
} from "../services/cuidador";

// NUEVO: comunas y cesfam
import { listComunas, type ComunaOut } from "../services/comuna";
import { listCesfam, type CesfamOut } from "../services/cesfam";

type Role = FrontUser["role"];

// *** SIEMPRE enviamos { user, token? } hacia arriba ***
interface LoginPageProps {
  onLogin: (auth: { user: FrontUser; token?: string }) => void;
}

// El service puede devolver FrontUser o { user, token? }
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

  // ----------- Estado formulario Paciente -----------
  const [pac, setPac] = useState<PacienteCreatePayload>({
    rut_paciente: 0,
    id_comuna: 0,
    primer_nombre_paciente: "",
    segundo_nombre_paciente: "",
    primer_apellido_paciente: "",
    segundo_apellido_paciente: "",
    fecha_nacimiento: "1990-01-01",
    sexo: true,
    tipo_de_sangre: "O+",
    enfermedades: "",
    seguro: "",
    direccion: "",
    telefono: 0,
    email: "",
    contrasena: "",
    tipo_paciente: "Crónico",
    nombre_contacto: "",
    telefono_contacto: 0,
    estado: true,
    id_cesfam: 1001,
    fecha_inicio_cesfam: "2024-01-01",
    fecha_fin_cesfam: null,
    activo_cesfam: true,
  });
  const [pacLoading, setPacLoading] = useState<boolean>(false);
  const [pacError, setPacError] = useState<string>("");

  // ----------- Estado formulario Cuidador -----------
  const [cui, setCui] = useState<CuidadorCreatePayload>({
    rut_cuidador: 0,
    primer_nombre_cuidador: "",
    segundo_nombre_cuidador: "",
    primer_apellido_cuidador: "",
    segundo_apellido_cuidador: "",
    sexo: true,
    direccion: "",
    telefono: 0,
    email: "",
    contrasena: "",
    estado: true,
  });
  const [cuiLoading, setCuiLoading] = useState<boolean>(false);
  const [cuiError, setCuiError] = useState<string>("");

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

      if ("user" in res) {
        onLogin({ user: res.user, token: res.token });
      } else {
        onLogin({ user: res });
      }
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

  /* =================== COMUNAS =================== */
  const [comunas, setComunas] = useState<ComunaOut[]>([]);
  const [loadingComunas, setLoadingComunas] = useState<boolean>(false);
  const [comunasError, setComunasError] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoadingComunas(true);
      setComunasError("");
      const resp = await listComunas({ page: 1, page_size: 5000 });
      if (!resp.ok) {
        setComunasError(resp.message || "No se pudieron obtener las comunas.");
        setComunas([]);
      } else {
        setComunas(resp.data.items ?? []);
      }
      setLoadingComunas(false);
    })();
  }, []);

  // filtro local comunas
  const [comunaSearch, setComunaSearch] = useState("");
  const comunasFiltradas = useMemo(() => {
    if (!comunaSearch.trim()) return comunas;
    const q = comunaSearch.toLowerCase();
    return comunas.filter((c) => c.nombre_comuna.toLowerCase().includes(q));
  }, [comunas, comunaSearch]);

  // Si cambia la comuna, limpia el CESFAM seleccionado
  useEffect(() => {
    setPac((p) => ({ ...p, id_cesfam: 0 }));
  }, [pac.id_comuna]);

  /* =================== CESFAM (por comuna) =================== */
  const [cesfams, setCesfams] = useState<CesfamOut[]>([]);
  const [loadingCesfam, setLoadingCesfam] = useState<boolean>(false);
  const [cesfamError, setCesfamError] = useState<string>("");
  const [cesfamSearch, setCesfamSearch] = useState("");

  // carga cesfam cuando hay comuna seleccionada
  useEffect(() => {
    const load = async () => {
      setCesfamError("");
      setCesfams([]);
      if (!pac.id_comuna) return;

      setLoadingCesfam(true);
      const resp = await listCesfam({ page: 1, page_size: 5000, id_comuna: pac.id_comuna, estado: true });
      if (!resp.ok) {
        setCesfamError(resp.message || "No se pudieron obtener los CESFAM.");
      } else {
        setCesfams(resp.data.items ?? []);
      }
      setLoadingCesfam(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pac.id_comuna]);

  const cesfamsFiltrados = useMemo(() => {
    if (!cesfamSearch.trim()) return cesfams;
    const q = cesfamSearch.toLowerCase();
    return cesfams.filter(
      (x) =>
        x.nombre_cesfam.toLowerCase().includes(q) ||
        (x.direccion ?? "").toLowerCase().includes(q)
    );
  }, [cesfams, cesfamSearch]);

  /* =================== REGISTRO: Paciente =================== */
  const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

  const submitPaciente = async () => {
    setPacError("");
    if (!pac.rut_paciente || String(pac.rut_paciente).length !== 9) {
      setPacError("RUT debe tener 9 dígitos (sin puntos ni guion).");
      return;
    }
    if (!pac.email) {
      setPacError("Email es requerido.");
      return;
    }
    if (!pac.contrasena) {
      setPacError("Contraseña es requerida.");
      return;
    }
    if (!pac.primer_nombre_paciente || !pac.primer_apellido_paciente || !pac.segundo_apellido_paciente) {
      setPacError("Completa nombres y apellidos requeridos.");
      return;
    }
    if (!pac.telefono || String(pac.telefono).length !== 9) {
      setPacError("Teléfono debe tener 9 dígitos.");
      return;
    }
    if (!pac.id_comuna) {
      setPacError("Selecciona una comuna.");
      return;
    }
    if (!pac.id_cesfam) {
      setPacError("Selecciona un CESFAM.");
      return;
    }
    try {
      setPacLoading(true);
      const resp = await createPaciente(pac);
      if (!resp.ok) {
        const msg = resp.details ? nicePacMsg(resp.details) : resp.message;
        setPacError(msg || "No se pudo registrar al paciente.");
        return;
      }
      setPatientModalOpen(false);
    } catch (e: any) {
      setPacError(e?.message || "Error inesperado registrando paciente.");
    } finally {
      setPacLoading(false);
    }
  };

  /* =================== REGISTRO: Cuidador =================== */
  const submitCuidador = async () => {
    setCuiError("");
    if (!cui.rut_cuidador || String(cui.rut_cuidador).length !== 9) {
      setCuiError("RUT debe tener 9 dígitos (sin puntos ni guion).");
      return;
    }
    if (!cui.email) {
      setCuiError("Email es requerido.");
      return;
    }
    if (!cui.contrasena) {
      setCuiError("Contraseña es requerida.");
      return;
    }
    if (!cui.primer_nombre_cuidador || !cui.primer_apellido_cuidador || !cui.segundo_apellido_cuidador) {
      setCuiError("Completa nombres y apellidos requeridos.");
      return;
    }
    if (!cui.telefono || String(cui.telefono).length !== 9) {
      setCuiError("Teléfono debe tener 9 dígitos.");
      return;
    }
    try {
      setCuiLoading(true);
      const resp = await createCuidador(cui);
      if (!resp.ok) {
        const msg = resp.details ? niceCuiMsg(resp.details) : resp.message;
        setCuiError(msg || "No se pudo registrar al cuidador.");
        return;
      }
      setCaregiverModalOpen(false);
    } catch (e: any) {
      setCuiError(e?.message || "Error inesperado registrando cuidador.");
    } finally {
      setCuiLoading(false);
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

      {/* MODAL: Registro Paciente */}
      <Dialog open={patientModalOpen} onOpenChange={setPatientModalOpen}>
        <DialogContent
          style={{ width: "96vw", maxWidth: "1000px", height: "85vh" }}
          className="overflow-hidden rounded-2xl p-0 flex flex-col"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-3 border-b">
            <DialogHeader>
              <DialogTitle>Registrar paciente</DialogTitle>
              <DialogDescription>Completa los datos requeridos por la API</DialogDescription>
            </DialogHeader>
            {pacError && <p className="text-sm text-red-600 mt-3">{pacError}</p>}
          </div>

          {/* Cuerpo */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {comunasError && <p className="text-sm text-red-600 mb-3">{comunasError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RUT */}
              <div className="space-y-2">
                <Label>RUT (9 dígitos)</Label>
                <Input
                  inputMode="numeric"
                  value={pac.rut_paciente ? String(pac.rut_paciente) : ""}
                  onChange={(e) =>
                    setPac({ ...pac, rut_paciente: Number(e.target.value.replace(/\D/g, "")) })
                  }
                  maxLength={9}
                  placeholder="212511374"
                />
              </div>

              {/* COMUNA (selector + buscador) */}
              <div className="space-y-2">
                <Label>Comuna</Label>
                <Input
                  placeholder="Buscar comuna…"
                  value={comunaSearch}
                  onChange={(e) => setComunaSearch(e.target.value)}
                />
                <Select
                  value={pac.id_comuna ? String(pac.id_comuna) : ""}
                  onValueChange={(v: string) => setPac({ ...pac, id_comuna: Number(v) })}
                  disabled={loadingComunas || comunasFiltradas.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingComunas ? "Cargando comunas…" : "Selecciona una comuna"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {comunasFiltradas.map((c) => (
                      <SelectItem key={c.id_comuna} value={String(c.id_comuna)}>
                        {c.nombre_comuna} (Región {c.id_region})
                      </SelectItem>
                    ))}
                    {(!loadingComunas && comunasFiltradas.length === 0) && (
                      <div className="px-2 py-1 text-sm text-gray-500">Sin resultados</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Nombres */}
              <div className="space-y-2">
                <Label>Primer nombre</Label>
                <Input
                  value={pac.primer_nombre_paciente}
                  onChange={(e) => setPac({ ...pac, primer_nombre_paciente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Segundo nombre</Label>
                <Input
                  value={pac.segundo_nombre_paciente}
                  onChange={(e) => setPac({ ...pac, segundo_nombre_paciente: e.target.value })}
                />
              </div>

              {/* Apellidos */}
              <div className="space-y-2">
                <Label>Primer apellido</Label>
                <Input
                  value={pac.primer_apellido_paciente}
                  onChange={(e) => setPac({ ...pac, primer_apellido_paciente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Segundo apellido</Label>
                <Input
                  value={pac.segundo_apellido_paciente}
                  onChange={(e) => setPac({ ...pac, segundo_apellido_paciente: e.target.value })}
                />
              </div>

              {/* Fecha / Sexo */}
              <div className="space-y-2">
                <Label>Fecha de nacimiento</Label>
                <Input
                  type="date"
                  value={pac.fecha_nacimiento}
                  onChange={(e) => setPac({ ...pac, fecha_nacimiento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select
                  value={pac.sexo ? "true" : "false"}
                  onValueChange={(v: string) => setPac({ ...pac, sexo: v === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Masculino</SelectItem>
                    <SelectItem value="false">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sangre */}
              <div className="space-y-2">
                <Label>Tipo de sangre</Label>
                <Select
                  value={pac.tipo_de_sangre}
                  onValueChange={(v: string) => setPac({ ...pac, tipo_de_sangre: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo de sangre" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((bt) => (
                      <SelectItem key={bt} value={bt}>
                        {bt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Enfermedades (opcional)</Label>
                <Input
                  value={pac.enfermedades ?? ""}
                  onChange={(e) => setPac({ ...pac, enfermedades: e.target.value })}
                />
              </div>

              {/* Seguro / Dirección */}
              <div className="space-y-2">
                <Label>Seguro (opcional)</Label>
                <Input
                  value={pac.seguro ?? ""}
                  onChange={(e) => setPac({ ...pac, seguro: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input value={pac.direccion} onChange={(e) => setPac({ ...pac, direccion: e.target.value })} />
              </div>

              {/* Teléfono / Email */}
              <div className="space-y-2">
                <Label>Teléfono (9 dígitos)</Label>
                <Input
                  inputMode="numeric"
                  value={pac.telefono ? String(pac.telefono) : ""}
                  onChange={(e) =>
                    setPac({ ...pac, telefono: Number(e.target.value.replace(/\D/g, "")) })
                  }
                  maxLength={9}
                  placeholder="987654321"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={pac.email}
                  onChange={(e) => setPac({ ...pac, email: e.target.value })}
                />
              </div>

              {/* Contraseña / Tipo paciente */}
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={pac.contrasena}
                  onChange={(e) => setPac({ ...pac, contrasena: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de paciente</Label>
                <Input
                  value={pac.tipo_paciente}
                  onChange={(e) => setPac({ ...pac, tipo_paciente: e.target.value })}
                />
              </div>

              {/* Contacto */}
              <div className="space-y-2">
                <Label>Nombre contacto</Label>
                <Input
                  value={pac.nombre_contacto}
                  onChange={(e) => setPac({ ...pac, nombre_contacto: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono contacto (9 dígitos)</Label>
                <Input
                  inputMode="numeric"
                  value={pac.telefono_contacto ? String(pac.telefono_contacto) : ""}
                  onChange={(e) =>
                    setPac({
                      ...pac,
                      telefono_contacto: Number(e.target.value.replace(/\D/g, "")),
                    })
                  }
                  maxLength={9}
                  placeholder="988887777"
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={pac.estado ? "true" : "false"}
                  onValueChange={(v: string) => setPac({ ...pac, estado: v === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CESFAM (selector + buscador; depende de comuna) */}
              <div className="space-y-2">
                <Label>CESFAM</Label>
                <Input
                  placeholder="Buscar CESFAM…"
                  value={cesfamSearch}
                  onChange={(e) => setCesfamSearch(e.target.value)}
                  disabled={!pac.id_comuna}
                />
                <Select
                  value={pac.id_cesfam ? String(pac.id_cesfam) : ""}
                  onValueChange={(v: string) => setPac({ ...pac, id_cesfam: Number(v) })}
                  disabled={!pac.id_comuna || loadingCesfam || cesfamsFiltrados.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !pac.id_comuna
                        ? "Primero selecciona una comuna"
                        : (loadingCesfam ? "Cargando CESFAM…" : "Selecciona un CESFAM")
                    } />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {cesfamsFiltrados.map((c) => (
                      <SelectItem key={c.id_cesfam} value={String(c.id_cesfam)}>
                        {c.nombre_cesfam}{c.direccion ? ` — ${c.direccion}` : ""}
                      </SelectItem>
                    ))}
                    {(!loadingCesfam && pac.id_comuna && cesfamsFiltrados.length === 0) && (
                      <div className="px-2 py-1 text-sm text-gray-500">Sin resultados</div>
                    )}
                  </SelectContent>
                </Select>
                {cesfamError && <p className="text-sm text-red-600">{cesfamError}</p>}
              </div>

              {/* Fechas CESFAM */}
              <div className="space-y-2">
                <Label>Fecha inicio CESFAM</Label>
                <Input
                  type="date"
                  value={pac.fecha_inicio_cesfam}
                  onChange={(e) => setPac({ ...pac, fecha_inicio_cesfam: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha fin CESFAM (opcional)</Label>
                <Input
                  type="date"
                  value={pac.fecha_fin_cesfam ?? ""}
                  onChange={(e) =>
                    setPac({ ...pac, fecha_fin_cesfam: e.target.value || null })
                  }
                />
              </div>

              {/* Activo CESFAM */}
              <div className="space-y-2">
                <Label>Activo CESFAM</Label>
                <Select
                  value={pac.activo_cesfam ? "true" : "false"}
                  onValueChange={(v: string) => setPac({ ...pac, activo_cesfam: v === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Activo CESFAM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-3 border-t">
            <DialogFooter>
              <Button variant="outline" onClick={() => setPatientModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submitPaciente} disabled={pacLoading}>
                {pacLoading ? "Creando..." : "Crear paciente"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Registro Cuidador */}
      <Dialog open={caregiverModalOpen} onOpenChange={setCaregiverModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar cuidador</DialogTitle>
            <DialogDescription>Completa los datos requeridos por la API</DialogDescription>
          </DialogHeader>

          {cuiError && <p className="text-sm text-red-600">{cuiError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RUT */}
            <div className="space-y-2">
              <Label>RUT (9 dígitos)</Label>
              <Input
                inputMode="numeric"
                value={cui.rut_cuidador ? String(cui.rut_cuidador) : ""}
                onChange={(e) => setCui({ ...cui, rut_cuidador: Number(e.target.value.replace(/\D/g, "")) })}
                maxLength={9}
                placeholder="212511374"
              />
            </div>

            {/* Nombres */}
            <div className="space-y-2">
              <Label>Primer nombre</Label>
              <Input
                value={cui.primer_nombre_cuidador}
                onChange={(e) => setCui({ ...cui, primer_nombre_cuidador: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Segundo nombre</Label>
              <Input
                value={cui.segundo_nombre_cuidador}
                onChange={(e) => setCui({ ...cui, segundo_nombre_cuidador: e.target.value })}
              />
            </div>

            {/* Apellidos */}
            <div className="space-y-2">
              <Label>Primer apellido</Label>
              <Input
                value={cui.primer_apellido_cuidador}
                onChange={(e) => setCui({ ...cui, primer_apellido_cuidador: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Segundo apellido</Label>
              <Input
                value={cui.segundo_apellido_cuidador}
                onChange={(e) => setCui({ ...cui, segundo_apellido_cuidador: e.target.value })}
              />
            </div>

            {/* Sexo / Dirección */}
            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select value={cui.sexo ? "true" : "false"} onValueChange={(v: string) => setCui({ ...cui, sexo: v === "true" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Masculino</SelectItem>
                  <SelectItem value="false">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={cui.direccion} onChange={(e) => setCui({ ...cui, direccion: e.target.value })} />
            </div>

            {/* Teléfono / Email */}
            <div className="space-y-2">
              <Label>Teléfono (9 dígitos)</Label>
              <Input
                inputMode="numeric"
                value={cui.telefono ? String(cui.telefono) : ""}
                onChange={(e) => setCui({ ...cui, telefono: Number(e.target.value.replace(/\D/g, "")) })}
                maxLength={9}
                placeholder="999998888"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={cui.email} onChange={(e) => setCui({ ...cui, email: e.target.value })} />
            </div>

            {/* Contraseña / Estado */}
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" value={cui.contrasena} onChange={(e) => setCui({ ...cui, contrasena: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={cui.estado ? "true" : "false"} onValueChange={(v: string) => setCui({ ...cui, estado: v === "true" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCaregiverModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitCuidador} disabled={cuiLoading}>
              {cuiLoading ? "Creando..." : "Crear cuidador"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

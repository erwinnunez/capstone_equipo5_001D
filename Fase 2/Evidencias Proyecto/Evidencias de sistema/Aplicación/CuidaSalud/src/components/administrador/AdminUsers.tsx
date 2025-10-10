// src/components/administrador/AdminUsers.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Filter, Users as UsersIcon, UserPlus, Edit, Trash2 } from "lucide-react";
import { systemUsers } from "../../data/adminMock";

import {
  createMedico,
  type EquipoMedicoCreatePayload,
  toNiceMessage as niceMedicoMsg,
} from "../../services/equipoMedico";
import {
  createCuidador,
  type CuidadorCreatePayload,
  toNiceMessage as niceCuiMsg,
} from "../../services/cuidador";
import {
  createPaciente,
  type PacienteCreatePayload,
  toNiceMessage as nicePacMsg,
} from "../../services/paciente";
import { Switch } from "../ui/switch";

// 👇 usamos tus services para leer comunas y cesfam
import { listComunas, type ComunaOut as ComunaRow } from "../../services/comuna";
import { listCesfam, type CesfamOut as CesfamRow } from "../../services/cesfam";

/* =========================
   DROPDOWN: Comuna (Select)
   - Muestra nombre_comuna
========================= */
function ComunaDropdown({
  value,
  onChange,
  label = "Comuna",
  placeholder = "Selecciona comuna…",
}: {
  value?: number | string;
  onChange: (id: number) => void;
  label?: string;
  placeholder?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<ComunaRow[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const resp = await listComunas({ page: 1, page_size: 5000 });
        if (!mounted) return;
        if (!resp.ok) {
          setErr(resp.message || "No se pudieron cargar las comunas");
        } else {
          setItems(resp.data.items || []);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || "No se pudieron cargar las comunas");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selected = items.find((c) => String(c.id_comuna) === String(value));

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select
        value={value != null ? String(value) : ""}
        onValueChange={(v) => onChange(Number(v))}
        disabled={loading || !!err}
      >
        {/* Deja <SelectValue /> sin children para que muestre el texto del item seleccionado */}
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {items.map((c) => (
            <SelectItem key={c.id_comuna} value={String(c.id_comuna)}>
              {c.nombre_comuna ?? `Comuna #${c.id_comuna}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && (
        <p className="text-xs text-muted-foreground">Seleccionada: {selected.nombre_comuna}</p>
      )}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

/* =========================
   DROPDOWN: CESFAM (Select)
   - Muestra "nombre_cesfam — nombre_comuna"
   - Filtra por idComuna si viene.
========================= */
function CesfamDropdown({
  value,
  onChange,
  idComuna,
  label = "CESFAM",
  placeholder = "Selecciona CESFAM…",
}: {
  value?: number | string;
  onChange: (id: number) => void;
  idComuna?: number | null;
  label?: string;
  placeholder?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<CesfamRow[]>([]);
  // cache local: id_comuna -> nombre_comuna
  const [comunaNames, setComunaNames] = useState<Record<number, string>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const resp = await listCesfam({
          page: 1,
          page_size: 5000,
          id_comuna: idComuna ?? undefined,
          estado: true,
        });
        if (!mounted) return;

        if (!resp.ok) {
          setErr(resp.message || "No se pudieron cargar los CESFAM");
          setItems([]);
          return;
        }

        const cesfams = resp.data.items || [];
        setItems(cesfams);

        // Cargar nombres de comunas usados por estos CESFAM
        const neededIds = Array.from(
          new Set(
            cesfams
              .map((i) => i.id_comuna)
              .filter((v): v is number => typeof v === "number")
          )
        );

        if (neededIds.length) {
          const comResp = await listComunas({ page: 1, page_size: 5000 });
          if (comResp.ok) {
            const map: Record<number, string> = {};
            for (const c of comResp.data.items) {
              map[c.id_comuna] = c.nombre_comuna;
            }
            const filtered: Record<number, string> = {};
            neededIds.forEach((id) => {
              filtered[id] = map[id] ?? `Comuna #${id}`;
            });
            if (mounted) setComunaNames(filtered);
          }
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || "No se pudieron cargar los CESFAM");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [idComuna]);

  const selected = items.find((c) => String(c.id_cesfam) === String(value));
  const selectedComuna =
    selected?.id_comuna != null ? comunaNames[selected.id_comuna] : undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select
        value={value != null ? String(value) : ""}
        onValueChange={(v) => onChange(Number(v))}
        disabled={loading || !!err}
      >
        {/* Deja <SelectValue /> sin children para que muestre el texto del item seleccionado */}
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="max-h-72">
          {items.map((c) => {
            const comunaName =
              c.id_comuna != null
                ? comunaNames[c.id_comuna] ?? `Comuna #${c.id_comuna}`
                : "—";
            return (
              <SelectItem key={c.id_cesfam} value={String(c.id_cesfam)}>
                {(c.nombre_cesfam ?? `CESFAM #${c.id_cesfam}`) + " — " + comunaName}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {selected && (
        <p className="text-xs text-muted-foreground">
          Seleccionado: {selected.nombre_cesfam}
          {selectedComuna ? ` — ${selectedComuna}` : ""}
        </p>
      )}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

/* ====== Resto del componente AdminUsers (usando dropdowns) ====== */

type RoleVariant = "default" | "secondary" | "destructive" | "outline";

type NewUserState = {
  role: "" | "doctor" | "caregiver" | "patient" | "admin";
  rut_medico: string;
  id_cesfam: string; // id (value) del CesfamDropdown
  primer_nombre_medico: string;
  segundo_nombre_medico: string;
  primer_apellido_medico: string;
  segundo_apellido_medico: string;
  email: string;
  contrasenia: string;
  telefono: string;
  direccion: string;
  especialidad: string;
  estado: boolean;
  is_admin: boolean;
};

type NewCuidadorState = {
  rut_cuidador: string;
  primer_nombre_cuidador: string;
  segundo_nombre_cuidador: string;
  primer_apellido_cuidador: string;
  segundo_apellido_cuidador: string;
  sexo: "true" | "false";
  direccion: string;
  telefono: string;
  email: string;
  contrasena: string;
  estado: "true" | "false";
};

type NewPacienteState = {
  rut_paciente: string;
  id_comuna: string; // id (value) de ComunaDropdown
  primer_nombre_paciente: string;
  segundo_nombre_paciente: string;
  primer_apellido_paciente: string;
  segundo_apellido_paciente: string;
  fecha_nacimiento: string;
  sexo: "true" | "false";
  tipo_de_sangre: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
  enfermedades: string;
  seguro: string;
  direccion: string;
  telefono: string;
  email: string;
  contrasena: string;
  tipo_paciente: string;
  nombre_contacto: string;
  telefono_contacto: string;
  estado: "true" | "false";
  id_cesfam: string; // id (value) del CesfamDropdown
  fecha_inicio_cesfam: string;
  fecha_fin_cesfam: string;
  activo_cesfam: "true" | "false";
};

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [caregiverModalOpen, setCaregiverModalOpen] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [savingCaregiver, setSavingCaregiver] = useState(false);
  const [savingPatient, setSavingPatient] = useState(false);
  const [cuiError, setCuiError] = useState<string | null>(null);
  const [pacError, setPacError] = useState<string | null>(null);

  const [newUser, setNewUser] = useState<NewUserState>({
    role: "",
    rut_medico: "",
    id_cesfam: "",
    primer_nombre_medico: "",
    segundo_nombre_medico: "",
    primer_apellido_medico: "",
    segundo_apellido_medico: "",
    email: "",
    contrasenia: "",
    telefono: "",
    direccion: "",
    especialidad: "",
    estado: true,
    is_admin: false,
  });

  const [newCui, setNewCui] = useState<NewCuidadorState>({
    rut_cuidador: "",
    primer_nombre_cuidador: "",
    segundo_nombre_cuidador: "",
    primer_apellido_cuidador: "",
    segundo_apellido_cuidador: "",
    sexo: "true",
    direccion: "",
    telefono: "",
    email: "",
    contrasena: "",
    estado: "true",
  });

  const [newPac, setNewPac] = useState<NewPacienteState>({
    rut_paciente: "",
    id_comuna: "",
    primer_nombre_paciente: "",
    segundo_nombre_paciente: "",
    primer_apellido_paciente: "",
    segundo_apellido_paciente: "",
    fecha_nacimiento: "1990-01-01",
    sexo: "true",
    tipo_de_sangre: "O+",
    enfermedades: "",
    seguro: "",
    direccion: "",
    telefono: "",
    email: "",
    contrasena: "",
    tipo_paciente: "Crónico",
    nombre_contacto: "",
    telefono_contacto: "",
    estado: "true",
    id_cesfam: "",
    fecha_inicio_cesfam: "2024-01-01",
    fecha_fin_cesfam: "",
    activo_cesfam: "true",
  });

  const getStatusColor = (status: string): RoleVariant => (status === "active" ? "outline" : "secondary");
  const getRoleColor = (role: string): RoleVariant => {
    switch (role) {
      case "admin":
        return "destructive";
      case "doctor":
        return "default";
      case "caregiver":
        return "secondary";
      case "patient":
        return "outline";
      default:
        return "outline";
    }
  };

  const roleLabel = (role: string) =>
    ({ admin: "Administrador", doctor: "Médico", caregiver: "Cuidador", patient: "Paciente" } as any)[role] ?? role;
  const statusLabel = (status: string) =>
    ({ active: "Activo", inactive: "Inactivo", blocked: "Bloqueado" } as any)[status] ?? status;

  const filteredUsers = systemUsers.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };
  const resetForm = () => {
    setNewUser({
      role: "",
      rut_medico: "",
      id_cesfam: "",
      primer_nombre_medico: "",
      segundo_nombre_medico: "",
      primer_apellido_medico: "",
      segundo_apellido_medico: "",
      email: "",
      contrasenia: "",
      telefono: "",
      direccion: "",
      especialidad: "",
      estado: true,
      is_admin: false,
    });
  };

  const onChangeRole = (value: string) => {
    if (value === "caregiver") {
      setIsCreateUserOpen(false);
      setTimeout(() => setCaregiverModalOpen(true), 0);
      return;
    }
    if (value === "patient") {
      setIsCreateUserOpen(false);
      setTimeout(() => setPatientModalOpen(true), 0);
      return;
    }
    setNewUser((prev) => ({ ...prev, role: value as NewUserState["role"], is_admin: value === "admin" }));
  };

  const handleCreateMedico = async () => {
    resetMessages();
    if (!newUser.role || (newUser.role !== "doctor" && newUser.role !== "admin")) {
      setErrorMsg("Debes seleccionar Médico o Administrador.");
      return;
    }
    try {
      setLoading(true);

      if (!newUser.rut_medico || newUser.rut_medico.length !== 9) {
        setErrorMsg("RUT del médico debe tener 9 dígitos.");
        setLoading(false);
        return;
      }
      if (!newUser.id_cesfam) {
        setErrorMsg("Debes seleccionar un CESFAM.");
        setLoading(false);
        return;
      }
      if (!newUser.primer_nombre_medico || !newUser.primer_apellido_medico) {
        setErrorMsg("Completa nombres y apellidos.");
        setLoading(false);
        return;
      }
      if (!newUser.email) {
        setErrorMsg("Debes indicar un email.");
        setLoading(false);
        return;
      }
      if (!newUser.contrasenia) {
        setErrorMsg("Debes indicar una contraseña.");
        setLoading(false);
        return;
      }
      if (!newUser.telefono || newUser.telefono.length !== 9) {
        setErrorMsg("El teléfono debe tener 9 dígitos.");
        setLoading(false);
        return;
      }
      if (!newUser.direccion) {
        setErrorMsg("Debes indicar la dirección.");
        setLoading(false);
        return;
      }
      if (!newUser.especialidad) {
        setErrorMsg("Debes indicar la especialidad.");
        setLoading(false);
        return;
      }

      const payload: EquipoMedicoCreatePayload = {
        rut_medico: Number(newUser.rut_medico),
        id_cesfam: Number(newUser.id_cesfam),
        primer_nombre_medico: newUser.primer_nombre_medico.trim(),
        segundo_nombre_medico: newUser.segundo_nombre_medico.trim()
          ? newUser.segundo_nombre_medico.trim()
          : null,
        primer_apellido_medico: newUser.primer_apellido_medico.trim(),
        segundo_apellido_medico: newUser.segundo_apellido_medico.trim(),
        email: newUser.email.trim(),
        contrasenia: newUser.contrasenia,
        telefono: Number(newUser.telefono),
        direccion: newUser.direccion.trim(),
        rol: "medico",
        especialidad: newUser.especialidad.trim(),
        estado: newUser.estado,
        is_admin: newUser.role === "admin",
      };

      const result = await createMedico(payload);
      if (!result.ok) {
        const msg = result.details ? niceMedicoMsg(result.details) : result.message;
        setErrorMsg(msg || "Error creando el médico.");
        setLoading(false);
        return;
      }

      setSuccessMsg(newUser.role === "admin" ? "Administrador creado correctamente." : "Médico creado correctamente.");
      setIsCreateUserOpen(false);
      resetForm();
    } catch (e: any) {
      setErrorMsg(e?.message || "Error inesperado al crear usuario.");
    } finally {
      setLoading(false);
    }
  };

  const [cuiErrorLocal, setCuiErrorLocal] = useState<string | null>(null);
  const handleCreateCuidador = async () => {
    setCuiError(null);
    setCuiErrorLocal(null);
    try {
      if (!newCui.rut_cuidador || newCui.rut_cuidador.length !== 9) {
        setCuiErrorLocal("RUT debe tener 9 dígitos.");
        return;
      }
      if (!newCui.primer_nombre_cuidador || !newCui.primer_apellido_cuidador || !newCui.segundo_apellido_cuidador) {
        setCuiErrorLocal("Completa nombres y apellidos.");
        return;
      }
      if (!newCui.email) {
        setCuiErrorLocal("Email es requerido.");
        return;
      }
      if (!newCui.contrasena) {
        setCuiErrorLocal("Contraseña es requerida.");
        return;
      }
      if (!newCui.telefono || newCui.telefono.length !== 9) {
        setCuiErrorLocal("Teléfono debe tener 9 dígitos.");
        return;
      }

      setSavingCaregiver(true);
      const payload: CuidadorCreatePayload = {
        rut_cuidador: Number(newCui.rut_cuidador),
        primer_nombre_cuidador: newCui.primer_nombre_cuidador.trim(),
        segundo_nombre_cuidador: newCui.segundo_nombre_cuidador.trim(),
        primer_apellido_cuidador: newCui.primer_apellido_cuidador.trim(),
        segundo_apellido_cuidador: newCui.segundo_apellido_cuidador.trim(),
        sexo: newCui.sexo === "true",
        direccion: newCui.direccion.trim(),
        telefono: Number(newCui.telefono),
        email: newCui.email.trim().toLowerCase(),
        contrasena: newCui.contrasena,
        estado: newCui.estado === "true",
      };
      const resp = await createCuidador(payload);
      if (!resp.ok) {
        const msg = resp.details ? niceCuiMsg(resp.details) : resp.message;
        setCuiError(msg || "No se pudo registrar al cuidador.");
        return;
      }
      setCaregiverModalOpen(false);
      setNewCui({
        rut_cuidador: "",
        primer_nombre_cuidador: "",
        segundo_nombre_cuidador: "",
        primer_apellido_cuidador: "",
        segundo_apellido_cuidador: "",
        sexo: "true",
        direccion: "",
        telefono: "",
        email: "",
        contrasena: "",
        estado: "true",
      });
    } catch (e: any) {
      setCuiError(e?.message || "Error inesperado registrando cuidador.");
    } finally {
      setSavingCaregiver(false);
    }
  };

  const [pacErrorLocal, setPacErrorLocal] = useState<string | null>(null);
  const handleCreatePaciente = async () => {
    setPacError(null);
    setPacErrorLocal(null);
    try {
      if (!newPac.rut_paciente || newPac.rut_paciente.length !== 9) {
        setPacErrorLocal("RUT debe tener 9 dígitos.");
        return;
      }
      if (!newPac.id_comuna) {
        setPacErrorLocal("Debes seleccionar la comuna.");
        return;
      }
      if (!newPac.id_cesfam) {
        setPacErrorLocal("Debes seleccionar un CESFAM.");
        return;
      }
      if (!newPac.email) {
        setPacErrorLocal("Email es requerido.");
        return;
      }
      if (!newPac.contrasena) {
        setPacErrorLocal("Contraseña es requerida.");
        return;
      }
      if (!newPac.primer_nombre_paciente || !newPac.primer_apellido_paciente || !newPac.segundo_apellido_paciente) {
        setPacErrorLocal("Completa nombres y apellidos requeridos.");
        return;
      }
      if (!newPac.telefono || newPac.telefono.length !== 9) {
        setPacErrorLocal("Teléfono debe tener 9 dígitos.");
        return;
      }
      if (!newPac.tipo_paciente) {
        setPacErrorLocal("Debes indicar el tipo de paciente.");
        return;
      }
      if (!newPac.nombre_contacto) {
        setPacErrorLocal("Debes indicar el nombre de contacto.");
        return;
      }
      if (!newPac.telefono_contacto || newPac.telefono_contacto.length !== 9) {
        setPacErrorLocal("Teléfono de contacto debe tener 9 dígitos.");
        return;
      }
      if (!newPac.fecha_inicio_cesfam) {
        setPacErrorLocal("Debes indicar la fecha inicio CESFAM.");
        return;
      }

      setSavingPatient(true);
      const payload: PacienteCreatePayload = {
        rut_paciente: Number(newPac.rut_paciente),
        id_comuna: Number(newPac.id_comuna),
        primer_nombre_paciente: newPac.primer_nombre_paciente.trim(),
        segundo_nombre_paciente: newPac.segundo_nombre_paciente.trim(),
        primer_apellido_paciente: newPac.primer_apellido_paciente.trim(),
        segundo_apellido_paciente: newPac.segundo_apellido_paciente.trim(),
        fecha_nacimiento: newPac.fecha_nacimiento,
        sexo: newPac.sexo === "true",
        tipo_de_sangre: newPac.tipo_de_sangre,
        enfermedades: newPac.enfermedades,
        seguro: newPac.seguro,
        direccion: newPac.direccion.trim(),
        telefono: Number(newPac.telefono),
        email: newPac.email.trim().toLowerCase(),
        contrasena: newPac.contrasena,
        tipo_paciente: newPac.tipo_paciente,
        nombre_contacto: newPac.nombre_contacto,
        telefono_contacto: Number(newPac.telefono_contacto),
        estado: newPac.estado === "true",
        id_cesfam: Number(newPac.id_cesfam),
        fecha_inicio_cesfam: newPac.fecha_inicio_cesfam,
        fecha_fin_cesfam: newPac.fecha_fin_cesfam ? newPac.fecha_fin_cesfam : null,
        activo_cesfam: newPac.activo_cesfam === "true",
      };
      const resp = await createPaciente(payload);
      if (!resp.ok) {
        const msg = resp.details ? nicePacMsg(resp.details) : resp.message;
        setPacError(msg || "No se pudo registrar al paciente.");
        return;
      }
      setPatientModalOpen(false);
      setNewPac({
        rut_paciente: "",
        id_comuna: "",
        primer_nombre_paciente: "",
        segundo_nombre_paciente: "",
        primer_apellido_paciente: "",
        segundo_apellido_paciente: "",
        fecha_nacimiento: "1990-01-01",
        sexo: "true",
        tipo_de_sangre: "O+",
        enfermedades: "",
        seguro: "",
        direccion: "",
        telefono: "",
        email: "",
        contrasena: "",
        tipo_paciente: "Crónico",
        nombre_contacto: "",
        telefono_contacto: "",
        estado: "true",
        id_cesfam: "",
        fecha_inicio_cesfam: "2024-01-01",
        fecha_fin_cesfam: "",
        activo_cesfam: "true",
      });
    } catch (e: any) {
      setPacError(e?.message || "Error inesperado registrando paciente.");
    } finally {
      setSavingPatient(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Usuarios del sistema
          <Dialog
            open={isCreateUserOpen}
            onOpenChange={(open: boolean) => {
              setIsCreateUserOpen(open);
              if (open) resetMessages();
            }}
          >
            <DialogTrigger>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar usuario
              </Button>
            </DialogTrigger>

            <DialogContent
              style={{ width: "96vw", maxWidth: "800px", height: "80vh" }}
              className="overflow-hidden rounded-2xl p-0 flex flex-col"
            >
              <div className="px-6 pt-6 pb-3 border-b">
                <DialogHeader>
                  <DialogTitle>Crear nuevo usuario</DialogTitle>
                  <DialogDescription>
                    Agrega un nuevo usuario al sistema con los permisos de rol correspondientes
                  </DialogDescription>
                </DialogHeader>
                {errorMsg && <p className="text-sm text-red-600">{String(errorMsg)}</p>}
                {successMsg && <p className="text-sm text-green-600">{String(successMsg)}</p>}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rol</label>
                    <Select value={newUser.role} onValueChange={onChangeRole}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Médico</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="caregiver">Cuidador</SelectItem>
                        <SelectItem value="patient">Paciente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(newUser.role === "doctor" || newUser.role === "admin") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">RUT médico (9 dígitos, sin guion)</label>
                        <Input
                          inputMode="numeric"
                          placeholder="212511374"
                          value={newUser.rut_medico}
                          onChange={(e) => setNewUser({ ...newUser, rut_medico: e.target.value.replace(/\D/g, "") })}
                          maxLength={9}
                        />
                      </div>

                      {/* CESFAM DROPDOWN (sin filtro por comuna) */}
                      <div className="space-y-2 md:col-span-1">
                        <CesfamDropdown
                          value={newUser.id_cesfam ? Number(newUser.id_cesfam) : undefined}
                          onChange={(id) => setNewUser((prev) => ({ ...prev, id_cesfam: String(id) }))}
                          label="CESFAM"
                        />
                        {!newUser.id_cesfam && (
                          <p className="text-xs text-amber-600 mt-1">Debes seleccionar un CESFAM.</p>
                        )}
                      </div>

                      {/* Nombres */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Primer nombre</label>
                        <Input
                          value={newUser.primer_nombre_medico}
                          onChange={(e) => setNewUser({ ...newUser, primer_nombre_medico: e.target.value })}
                          placeholder="Laura"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Segundo nombre (opcional)</label>
                        <Input
                          value={newUser.segundo_nombre_medico}
                          onChange={(e) => setNewUser({ ...newUser, segundo_nombre_medico: e.target.value })}
                          placeholder="Isabel"
                        />
                      </div>

                      {/* Apellidos */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Primer apellido</label>
                        <Input
                          value={newUser.primer_apellido_medico}
                          onChange={(e) => setNewUser({ ...newUser, primer_apellido_medico: e.target.value })}
                          placeholder="González"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Segundo apellido</label>
                        <Input
                          value={newUser.segundo_apellido_medico}
                          onChange={(e) => setNewUser({ ...newUser, segundo_apellido_medico: e.target.value })}
                          placeholder="Pérez"
                        />
                      </div>

                      {/* Email / Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Correo electrónico</label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="medico@salud.cl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contraseña inicial</label>
                        <Input
                          type="password"
                          value={newUser.contrasenia}
                          onChange={(e) => setNewUser({ ...newUser, contrasenia: e.target.value })}
                          placeholder="Mínimo 8 caracteres"
                        />
                      </div>

                      {/* Teléfono / Dirección */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Teléfono (9 dígitos)</label>
                        <Input
                          inputMode="numeric"
                          value={newUser.telefono}
                          onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value.replace(/\D/g, "") })}
                          placeholder="987654321"
                          maxLength={9}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <label className="text-sm font-medium">Dirección</label>
                        <Input
                          value={newUser.direccion}
                          onChange={(e) => setNewUser({ ...newUser, direccion: e.target.value })}
                          placeholder="Luis Thayer 100"
                        />
                      </div>

                      {/* Especialidad */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Especialidad</label>
                        <Input
                          value={newUser.especialidad}
                          onChange={(e) => setNewUser({ ...newUser, especialidad: e.target.value })}
                          placeholder="Medicina Interna"
                        />
                      </div>

                      {/* Estado */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Estado</label>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={newUser.estado}
                            onCheckedChange={(v: boolean) => setNewUser({ ...newUser, estado: v })}
                            id="estadoSwitch"
                          />
                          <label htmlFor="estadoSwitch" className="text-sm">
                            {newUser.estado ? "Activo" : "Inactivo"}
                          </label>
                        </div>
                      </div>

                      {/* is_admin (solo para Administrador) */}
                      {newUser.role === "admin" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Administrador</label>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={newUser.is_admin}
                              onCheckedChange={(v: boolean) => setNewUser({ ...newUser, is_admin: v })}
                              id="adminSwitch"
                            />
                            <label htmlFor="adminSwitch" className="text-sm">
                              {newUser.is_admin ? "Sí" : "No"}
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Para admin, se crea un médico con <b>is_admin=true</b>.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t">
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateUserOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  {(newUser.role === "doctor" || newUser.role === "admin") && (
                    <Button onClick={handleCreateMedico} disabled={loading}>
                      {loading ? "Creando..." : "Crear usuario"}
                    </Button>
                  )}
                  {!newUser.role && <Button disabled>Selecciona un rol</Button>}
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Administra cuentas, roles y permisos</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterRole} onValueChange={(value: string) => setFilterRole(value)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="doctor">Médicos</SelectItem>
              <SelectItem value="caregiver">Cuidadores</SelectItem>
              <SelectItem value="patient">Pacientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {systemUsers
            .filter((u) => {
              const q = searchTerm.toLowerCase();
              const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
              const matchesRole = filterRole === "all" || u.role === filterRole;
              return matchesSearch && matchesRole;
            })
            .map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Último acceso: {user.lastLogin}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant={getRoleColor(user.role)}>{roleLabel(user.role)}</Badge>
                  <Badge variant={getStatusColor(user.status)}>{statusLabel(user.status)}</Badge>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" aria-label="Editar usuario">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" aria-label="Eliminar usuario">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>

      {/* ===================== MODAL: Crear Cuidador ===================== */}
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
            {(cuiError || cuiErrorLocal) && (
              <p className="text-sm text-red-600 mt-3">{cuiError ?? cuiErrorLocal}</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">RUT (9 dígitos)</label>
                <Input
                  inputMode="numeric"
                  value={newCui.rut_cuidador}
                  onChange={(e) =>
                    setNewCui({ ...newCui, rut_cuidador: e.target.value.replace(/\D/g, "") })
                  }
                  maxLength={9}
                  placeholder="212511374"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Primer nombre</label>
                <Input
                  value={newCui.primer_nombre_cuidador}
                  onChange={(e) =>
                    setNewCui({ ...newCui, primer_nombre_cuidador: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Segundo nombre</label>
                <Input
                  value={newCui.segundo_nombre_cuidador}
                  onChange={(e) =>
                    setNewCui({ ...newCui, segundo_nombre_cuidador: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Primer apellido</label>
                <Input
                  value={newCui.primer_apellido_cuidador}
                  onChange={(e) =>
                    setNewCui({ ...newCui, primer_apellido_cuidador: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Segundo apellido</label>
                <Input
                  value={newCui.segundo_apellido_cuidador}
                  onChange={(e) =>
                    setNewCui({ ...newCui, segundo_apellido_cuidador: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sexo</label>
                <Select
                  value={newCui.sexo}
                  onValueChange={(v) => setNewCui({ ...newCui, sexo: v as "true" | "false" })}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Dirección</label>
                <Input
                  value={newCui.direccion}
                  onChange={(e) => setNewCui({ ...newCui, direccion: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono (9 dígitos)</label>
                <Input
                  inputMode="numeric"
                  value={newCui.telefono}
                  onChange={(e) =>
                    setNewCui({ ...newCui, telefono: e.target.value.replace(/\D/g, "") })
                  }
                  maxLength={9}
                  placeholder="999998888"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newCui.email}
                  onChange={(e) => setNewCui({ ...newCui, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña</label>
                <Input
                  type="password"
                  value={newCui.contrasena}
                  onChange={(e) => setNewCui({ ...newCui, contrasena: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select
                  value={newCui.estado}
                  onValueChange={(v) => setNewCui({ ...newCui, estado: v as "true" | "false" })}
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
            </div>
          </div>

          <div className="px-6 pb-6 pt-3 border-t">
            <DialogFooter>
              <Button variant="outline" onClick={() => setCaregiverModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCuidador} disabled={savingCaregiver}>
                {savingCaregiver ? "Creando..." : "Crear cuidador"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL: Crear Paciente ===================== */}
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
            {(pacError || pacErrorLocal) && (
              <p className="text-sm text-red-600 mt-3">{pacError ?? pacErrorLocal}</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">RUT (9 dígitos)</label>
                <Input
                  inputMode="numeric"
                  value={newPac.rut_paciente}
                  onChange={(e) =>
                    setNewPac({ ...newPac, rut_paciente: e.target.value.replace(/\D/g, "") })
                  }
                  maxLength={9}
                  placeholder="212511374"
                />
              </div>

              {/* Comuna como DESPLEGABLE */}
              <div className="space-y-2 md:col-span-1">
                <ComunaDropdown
                  value={newPac.id_comuna ? Number(newPac.id_comuna) : undefined}
                  onChange={(id) =>
                    setNewPac((prev) => ({
                      ...prev,
                      id_comuna: String(id),
                      // si cambia comuna, resetea CESFAM para evitar inconsistencia
                      id_cesfam: prev.id_comuna !== String(id) ? "" : prev.id_cesfam,
                    }))
                  }
                  label="Comuna"
                />
                {!newPac.id_comuna && (
                  <p className="text-xs text-amber-600 mt-1">Debes seleccionar una comuna.</p>
                )}
              </div>

              {/* CESFAM DROPDOWN (filtrado por comuna) */}
              <div className="space-y-2 md:col-span-2">
                <CesfamDropdown
                  value={newPac.id_cesfam ? Number(newPac.id_cesfam) : undefined}
                  onChange={(id) => setNewPac((prev) => ({ ...prev, id_cesfam: String(id) }))}
                  idComuna={newPac.id_comuna ? Number(newPac.id_comuna) : undefined}
                  label="CESFAM (de la comuna seleccionada)"
                />
                {!newPac.id_cesfam && (
                  <p className="text-xs text-amber-600 mt-1">Debes seleccionar un CESFAM.</p>
                )}
              </div>

              {/* Nombres */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Primer nombre</label>
                <Input
                  value={newPac.primer_nombre_paciente}
                  onChange={(e) => setNewPac({ ...newPac, primer_nombre_paciente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Segundo nombre</label>
                <Input
                  value={newPac.segundo_nombre_paciente}
                  onChange={(e) => setNewPac({ ...newPac, segundo_nombre_paciente: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Primer apellido</label>
                <Input
                  value={newPac.primer_apellido_paciente}
                  onChange={(e) => setNewPac({ ...newPac, primer_apellido_paciente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Segundo apellido</label>
                <Input
                  value={newPac.segundo_apellido_paciente}
                  onChange={(e) => setNewPac({ ...newPac, segundo_apellido_paciente: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de nacimiento</label>
                <Input
                  type="date"
                  value={newPac.fecha_nacimiento}
                  onChange={(e) => setNewPac({ ...newPac, fecha_nacimiento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sexo</label>
                <Select
                  value={newPac.sexo}
                  onValueChange={(v) => setNewPac({ ...newPac, sexo: v as "true" | "false" })}
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de sangre</label>
                <Select
                  value={newPac.tipo_de_sangre}
                  onValueChange={(v) =>
                    setNewPac({ ...newPac, tipo_de_sangre: v as NewPacienteState["tipo_de_sangre"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo de sangre" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((bt) => (
                      <SelectItem key={bt} value={bt}>
                        {bt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Enfermedades (opcional)</label>
                <Input
                  value={newPac.enfermedades}
                  onChange={(e) => setNewPac({ ...newPac, enfermedades: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Seguro (opcional)</label>
                <Input
                  value={newPac.seguro}
                  onChange={(e) => setNewPac({ ...newPac, seguro: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dirección</label>
                <Input
                  value={newPac.direccion}
                  onChange={(e) => setNewPac({ ...newPac, direccion: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono (9 dígitos)</label>
                <Input
                  inputMode="numeric"
                  value={newPac.telefono}
                  onChange={(e) => setNewPac({ ...newPac, telefono: e.target.value.replace(/\D/g, "") })}
                  maxLength={9}
                  placeholder="987654321"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newPac.email}
                  onChange={(e) => setNewPac({ ...newPac, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña</label>
                <Input
                  type="password"
                  value={newPac.contrasena}
                  onChange={(e) => setNewPac({ ...newPac, contrasena: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de paciente</label>
                <Input
                  value={newPac.tipo_paciente}
                  onChange={(e) => setNewPac({ ...newPac, tipo_paciente: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre contacto</label>
                <Input
                  value={newPac.nombre_contacto}
                  onChange={(e) => setNewPac({ ...newPac, nombre_contacto: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono contacto (9 dígitos)</label>
                <Input
                  inputMode="numeric"
                  value={newPac.telefono_contacto}
                  onChange={(e) =>
                    setNewPac({ ...newPac, telefono_contacto: e.target.value.replace(/\D/g, "") })
                  }
                  maxLength={9}
                  placeholder="988887777"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select
                  value={newPac.estado}
                  onValueChange={(v) => setNewPac({ ...newPac, estado: v as "true" | "false" })}
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

              {/* Fechas / Activo CESFAM */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha inicio CESFAM</label>
                <Input
                  type="date"
                  value={newPac.fecha_inicio_cesfam}
                  onChange={(e) => setNewPac({ ...newPac, fecha_inicio_cesfam: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha fin CESFAM (opcional)</label>
                <Input
                  type="date"
                  value={newPac.fecha_fin_cesfam}
                  onChange={(e) => setNewPac({ ...newPac, fecha_fin_cesfam: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Activo CESFAM</label>
                <Select
                  value={newPac.activo_cesfam}
                  onValueChange={(v) => setNewPac({ ...newPac, activo_cesfam: v as "true" | "false" })}
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

          <div className="px-6 pb-6 pt-3 border-t">
            <DialogFooter>
              <Button variant="outline" onClick={() => setPatientModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePaciente} disabled={savingPatient}>
                {savingPatient ? "Creando..." : "Crear paciente"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

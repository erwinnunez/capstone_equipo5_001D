// src/components/administrador/AdminUsers.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { Badge } from "../ui/badge";
import { systemUsers } from "../../data/adminMock";

import {
  createMedico,
  type EquipoMedicoCreatePayload,
  toNiceMessage as niceMedicoMsg,
} from "../../services/equipoMedico";

// Modal de alerta (archivo que te pasé antes)
import { ErrorAlertModal } from "../common/ErrorAlertModal";

// 👇 servicios para dropdowns
import { listComunas, type ComunaOut as ComunaRow } from "../../services/comuna";
import { listCesfam, type CesfamOut as CesfamRow } from "../../services/cesfam";

/* ==========================================================
   Helpers generales
========================================================== */
function onlyDigits(v: string) {
  return (v.match(/\d/g) || []).join("");
}

/* ==========================================================
   Helpers de RUT (mantener dígitos + K/k y formatear visual)
========================================================== */
/** Limpia a RUT "plano": solo 0-9 y K (en mayúsculas), máx 9 chars */
function cleanRutPlain(input: string): string {
  const kept = (input.toUpperCase().match(/[0-9K]/g) || []).join("");
  return kept.slice(0, 9);
}

/** Valida RUT plano (8 o 9 de largo; DV puede ser 0-9 o K) */
function isValidPlainRut(plain: string): boolean {
  const v = plain.toUpperCase();
  if (v.length < 8 || v.length > 9) return false;
  // Último carácter: dígito o K, resto dígitos
  return /^[0-9]{7,8}[0-9K]$/.test(v);
}

/** Formatea un RUT plano a "12.345.678-9" (solo vista) */
function formatRutPrettyFromPlain(plain: string): string {
  const v = plain.toUpperCase();
  if (!v) return "";
  const cuerpo = v.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const dv = v.slice(-1);
  return cuerpo ? `${cuerpo}-${dv}` : dv;
}

/* =========================
   DROPDOWN: Comuna (Select)
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
      {selected && <p className="text-xs text-muted-foreground">Seleccionada: {selected.nombre_comuna}</p>}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

/* =========================
   DROPDOWN: CESFAM (Select)
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

        const neededIds = Array.from(
          new Set(cesfams.map((i) => i.id_comuna).filter((v): v is number => typeof v === "number"))
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
  const selectedComuna = selected?.id_comuna != null ? comunaNames[selected.id_comuna] : undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select
        value={value != null ? String(value) : ""}
        onValueChange={(v) => onChange(Number(v))}
        disabled={loading || !!err}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="max-h-72">
          {items.map((c) => {
            const comunaName =
              c.id_comuna != null ? comunaNames[c.id_comuna] ?? `Comuna #${c.id_comuna}` : "—";
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

/* =======================
   Tipos y estado local
======================= */
type RoleVariant = "default" | "secondary" | "destructive" | "outline";

type NewUserState = {
  role: "" | "doctor" | "admin";
  rut_medico: string; // <-- RUT plano (0-9 y K)
  id_cesfam: string; // id (value) del CesfamDropdown
  primer_nombre_medico: string;
  segundo_nombre_medico: string;
  primer_apellido_medico: string;
  segundo_apellido_medico: string;
  email: string;
  contrasenia: string;
  telefono: string; // solo dígitos
  direccion: string;
  especialidad: string;
};

const getStatusColor = (status: string): RoleVariant => (status === "active" ? "outline" : "secondary");
const getRoleColor = (role: string): RoleVariant => {
  switch (role) {
    case "admin":
      return "destructive";
    case "doctor":
      return "default";
    default:
      return "outline";
  }
};
const roleLabel = (role: string) => ({ admin: "Administrador", doctor: "Médico" } as any)[role] ?? role;
const statusLabel = (status: string) =>
  ({ active: "Activo", inactive: "Inactivo", blocked: "Bloqueado" } as any)[status] ?? status;

/* =======================
   Componente principal
======================= */
export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal de error
  const [errOpen, setErrOpen] = useState(false);
  const [errTitle, setErrTitle] = useState("Error en el formulario");
  const [errMsg, setErrMsg] = useState("");

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
  });

  const filteredUsers = systemUsers.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
    });
  };

  const onChangeRole = (value: string) => {
    setNewUser((prev) => ({ ...prev, role: value as NewUserState["role"] }));
  };

  const showError = (message: string, title = "Error en el formulario") => {
    setErrTitle(title);
    setErrMsg(message);
    setErrOpen(true);
  };

  const handleCreateMedico = async () => {
    if (!newUser.role || (newUser.role !== "doctor" && newUser.role !== "admin")) {
      return showError("Debes seleccionar Médico o Administrador.");
    }
    try {
      setLoading(true);

      const rutPlano = newUser.rut_medico.toUpperCase();

      if (!isValidPlainRut(rutPlano)) {
        setLoading(false);
        return showError("RUT del médico inválido. Debe tener 8-9 caracteres y DV 0-9/K.");
      }
      if (!newUser.id_cesfam) {
        setLoading(false);
        return showError("Debes seleccionar un CESFAM.");
      }
      if (!newUser.primer_nombre_medico || !newUser.primer_apellido_medico) {
        setLoading(false);
        return showError("Completa nombres y apellidos.");
      }
      if (!newUser.email) {
        setLoading(false);
        return showError("Debes indicar un email válido.");
      }
      if (!newUser.contrasenia) {
        setLoading(false);
        return showError("Debes indicar una contraseña.");
      }
      if (!newUser.telefono || newUser.telefono.length !== 9) {
        setLoading(false);
        return showError("El teléfono debe tener 9 dígitos.");
      }
      if (!newUser.direccion) {
        setLoading(false);
        return showError("Debes indicar la dirección.");
      }
      if (!newUser.especialidad) {
        setLoading(false);
        return showError("Debes indicar la especialidad.");
      }

      const payload: EquipoMedicoCreatePayload = {
        // 🔴 Enviamos el RUT como STRING con posible K
        rut_medico: rutPlano,
        id_cesfam: Number(newUser.id_cesfam),
        primer_nombre_medico: newUser.primer_nombre_medico.trim(),
        segundo_nombre_medico: newUser.segundo_nombre_medico.trim()
          ? newUser.segundo_nombre_medico.trim()
          : null,
        primer_apellido_medico: newUser.primer_apellido_medico.trim(),
        segundo_apellido_medico: newUser.segundo_apellido_medico.trim(),
        email: newUser.email.trim(),
        contrasenia: newUser.contrasenia,
        telefono: Number(onlyDigits(newUser.telefono)),
        direccion: newUser.direccion.trim(),
        rol: "medico",
        especialidad: newUser.especialidad.trim(),
        estado: true, // siempre true
        is_admin: newUser.role === "admin", // si el rol seleccionado es admin
      };

      const result = await createMedico(payload);
      if (!result.ok) {
        setLoading(false);
        const msg = result.details ? niceMedicoMsg(result.details) : result.message;
        return showError(msg || "Error creando el médico.", "No se pudo crear");
      }

      setIsCreateUserOpen(false);
      resetForm();
    } catch (e: any) {
      showError(e?.message || "Error inesperado al crear usuario.", "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      {/* MODAL DE ERROR */}
      <ErrorAlertModal
        open={errOpen}
        title={errTitle}
        message={errMsg}
        onClose={() => setErrOpen(false)}
      />

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Usuarios del sistema
          <Dialog
            open={isCreateUserOpen}
            onOpenChange={(open: boolean) => {
              setIsCreateUserOpen(open);
              if (open) {
                // limpiar mensajes previos
                setErrOpen(false);
                setErrMsg("");
                setErrTitle("Error en el formulario");
              }
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
                      </SelectContent>
                    </Select>
                  </div>

                  {(newUser.role === "doctor" || newUser.role === "admin") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* RUT con formato visual y preservando K */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">RUT médico</label>
                        <Input
                          // Usamos text para permitir 'K'
                          inputMode="text"
                          placeholder="12.345.678-9"
                          value={formatRutPrettyFromPlain(newUser.rut_medico)}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              rut_medico: cleanRutPlain(e.target.value),
                            })
                          }
                          // largo por puntos y guion en la vista
                          maxLength={12}
                        />
                      </div>

                      {/* CESFAM */}
                      <div className="space-y-2 md:col-span-1">
                        <CesfamDropdown
                          value={newUser.id_cesfam ? Number(newUser.id_cesfam) : undefined}
                          onChange={(id) => setNewUser((prev) => ({ ...prev, id_cesfam: String(id) }))}
                          label="CESFAM"
                        />
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
                          onChange={(e) =>
                            setNewUser({ ...newUser, telefono: onlyDigits(e.target.value).slice(0, 9) })
                          }
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
                  {(newUser.role === "doctor" || newUser.role === "admin") ? (
                    <Button onClick={handleCreateMedico} disabled={loading}>
                      {loading ? "Creando..." : "Crear usuario"}
                    </Button>
                  ) : (
                    <Button disabled>Selecciona un rol</Button>
                  )}
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
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
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
    </Card>
  );
}

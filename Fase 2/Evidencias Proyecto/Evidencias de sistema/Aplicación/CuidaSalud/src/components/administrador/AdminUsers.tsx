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
import { Search, Filter, Users as UsersIcon, UserPlus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

import {
  createMedico,
  listMedicos,
  updateMedico,
  toggleMedicoStatus,
  type EquipoMedicoCreatePayload,
  toNiceMessage as niceMedicoMsg,
} from "../../services/equipoMedico";

import { listCuidadores, updateCuidador, toggleCuidadorStatus } from "../../services/cuidador";
import { listPacientes, updatePaciente, togglePacienteStatus } from "../../services/paciente";

// Modal de alerta (archivo que te pasé antes)
import { ErrorAlertModal } from "../common/ErrorAlertModal";

// 👇 servicios para dropdowns
import { listComunas } from "../../services/comuna";
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
        onValueChange={(v: string) => onChange(Number(v))}
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

// Tipo unificado para mostrar usuarios del sistema
type UnifiedUser = {
  id: string;
  rut: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "caregiver" | "patient";
  status: "active" | "inactive";
  phone?: string;
  address?: string;
  specialty?: string;
  cesfam?: string;
  comuna?: string;
  // Campos del contacto de emergencia (solo para pacientes)
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};

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
const roleLabel = (role: string) => ({ 
  admin: "Administrador", 
  doctor: "Médico", 
  caregiver: "Cuidador", 
  patient: "Paciente" 
} as any)[role] ?? role;
const statusLabel = (status: string) =>
  ({ active: "Activo", inactive: "Inactivo", blocked: "Bloqueado" } as any)[status] ?? status;

/* =======================
   Componente principal
======================= */
export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // Nuevo filtro para estado
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<UnifiedUser[]>([]);
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

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

  // Estado para almacenar todos los usuarios
  const [allUsers, setAllUsers] = useState<UnifiedUser[]>([]);

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UnifiedUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    telefono: "",
    direccion: "",
    especialidad: "",
    isAdmin: false, // Para el toggle de administrador
    // Campos del contacto de emergencia (solo para pacientes)
    contactoNombre: "",
    contactoTelefono: "",
  });

  // Cargar todos los usuarios del sistema
  const loadAllSystemUsers = async (estadoFilter?: boolean) => {
    try {
      setLoadingUsers(true);
      
      // Limpiar datos anteriores inmediatamente para evitar mostrar datos incorrectos
      setAllUsers([]);
      setUsers([]);
      setTotalUsers(0);
      
      const allUsersArray: UnifiedUser[] = [];

      // Determinar parámetros de consulta según el filtro
      const queryParams: any = { page: 1, page_size: 1000 };
      if (estadoFilter !== undefined) {
        queryParams.estado = estadoFilter;
      }

      console.log('Cargando usuarios con parámetros:', queryParams);

      // 1. Cargar médicos y administradores
      try {
        const medicosResponse = await listMedicos(queryParams);
        const medicos = medicosResponse.items || [];
        
        console.log(`Médicos encontrados: ${medicos.length}`);
        console.log('Estados de médicos:', medicos.map(m => ({ rut: m.rut_medico, estado: m.estado })));
        
        medicos.forEach((medico: any) => {
          allUsersArray.push({
            id: medico.rut_medico,
            rut: medico.rut_medico,
            name: `${medico.primer_nombre_medico} ${medico.segundo_nombre_medico || ''} ${medico.primer_apellido_medico} ${medico.segundo_apellido_medico || ''}`.trim(),
            email: medico.email || 'Sin email',
            role: medico.is_admin ? "admin" : "doctor",
            status: medico.estado ? "active" : "inactive",
            phone: medico.telefono ? String(medico.telefono) : undefined,
            address: medico.direccion || undefined,
            specialty: medico.especialidad || undefined,
          });
        });
      } catch (error) {
        console.warn("Error cargando médicos:", error);
      }

      // 2. Cargar cuidadores
      try {
        const cuidadoresResponse = await listCuidadores(queryParams);
        const cuidadores = cuidadoresResponse.items || [];
        
        cuidadores.forEach((cuidador: any) => {
          allUsersArray.push({
            id: cuidador.rut_cuidador,
            rut: cuidador.rut_cuidador,
            name: `${cuidador.primer_nombre_cuidador} ${cuidador.segundo_nombre_cuidador || ''} ${cuidador.primer_apellido_cuidador} ${cuidador.segundo_apellido_cuidador || ''}`.trim(),
            email: cuidador.email || 'Sin email',
            role: "caregiver",
            status: cuidador.estado ? "active" : "inactive",
            phone: cuidador.telefono ? String(cuidador.telefono) : undefined,
            address: cuidador.direccion || undefined,
          });
        });
      } catch (error) {
        console.warn("Error cargando cuidadores:", error);
      }

      // 3. Cargar pacientes
      try {
        const pacientesResponse = await listPacientes(queryParams);
        const pacientes = pacientesResponse.items || [];
        
        pacientes.forEach((paciente: any) => {
          allUsersArray.push({
            id: paciente.rut_paciente,
            rut: paciente.rut_paciente,
            name: `${paciente.primer_nombre_paciente} ${paciente.segundo_nombre_paciente || ''} ${paciente.primer_apellido_paciente} ${paciente.segundo_apellido_paciente || ''}`.trim(),
            email: paciente.email || 'Sin email',
            role: "patient",
            status: paciente.estado ? "active" : "inactive",
            phone: paciente.telefono ? String(paciente.telefono) : undefined,
            address: paciente.direccion || undefined,
            emergencyContactName: paciente.nombre_contacto || '',
            emergencyContactPhone: paciente.telefono_contacto ? String(paciente.telefono_contacto) : '',
          });
        });
      } catch (error) {
        console.warn("Error cargando pacientes:", error);
      }

      setAllUsers(allUsersArray);
      setTotalUsers(allUsersArray.length);
      
      // Log detallado de usuarios por estado
      const activeUsers = allUsersArray.filter(u => u.status === 'active');
      const inactiveUsers = allUsersArray.filter(u => u.status === 'inactive');
      
      console.log(`✅ Cargados ${allUsersArray.length} usuarios totales del sistema`);
      console.log(`🟢 Activos: ${activeUsers.length}, 🔴 Inactivos: ${inactiveUsers.length}`);
      console.log('Usuarios inactivos:', inactiveUsers.map(u => ({ rut: u.rut, name: u.name, role: u.role, status: u.status })));
      
    } catch (error) {
      console.error("❌ Error general cargando usuarios:", error);
      showError("Error cargando usuarios del sistema", "Error de conexión");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Cargar usuarios del sistema con paginación
  const loadSystemUsers = async (page = 1) => {
    setCurrentPage(page);
    
    // Aplicar filtros a todos los usuarios
    const filtered = allUsers.filter((u) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.rut.includes(q);
      const matchesRole = filterRole === "all" || u.role === filterRole;
      
      // Solo aplicar filtro de estado cuando es "all" (sin filtro en backend)
      // Para otros casos, confiar en que el backend ya filtró correctamente
      const matchesStatus = filterStatus === "all" ? true : u.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Aplicar paginación
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = filtered.slice(startIndex, endIndex);

    setUsers(paginatedUsers);
    setTotalUsers(filtered.length);
  };

  // Cargar todos los usuarios al montar el componente
  useEffect(() => {
    loadAllSystemUsers();
  }, []);

  // Recargar datos del backend cuando cambie el filtro de estado
  useEffect(() => {
    let estadoParam: boolean | undefined;
    
    if (filterStatus === "active") {
      estadoParam = true;
    } else if (filterStatus === "inactive") {
      estadoParam = false;
    }
    // Si filterStatus === "all", estadoParam queda undefined
    
    console.log(`Filtro de estado cambió a: ${filterStatus}, recargando con estado: ${estadoParam}`);
    loadAllSystemUsers(estadoParam);
  }, [filterStatus]);

  // Aplicar paginación cuando cambien los datos, filtros o página
  useEffect(() => {
    if (allUsers.length > 0) {
      loadSystemUsers(currentPage);
    }
  }, [allUsers, searchTerm, filterRole, currentPage]); // Removido filterStatus ya que se maneja arriba

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, filterRole, filterStatus]);

  // Eliminar el filtro local ya que se hace en loadSystemUsers
  const filteredUsers = users;

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

  // Función para abrir el modal de edición
  const handleEditUser = (user: UnifiedUser) => {
    setEditingUser(user);
    
    // Separar nombres y apellidos del usuario
    const nameParts = user.name.split(' ');
    const primerNombre = nameParts[0] || '';
    const segundoNombre = nameParts[1] || '';
    const primerApellido = nameParts[2] || '';
    const segundoApellido = nameParts[3] || '';
    
    // Separar nombre del contacto de emergencia si existe
    const emergencyContactName = user.emergencyContactName || '';
    
    setEditFormData({
      primerNombre: primerNombre,
      segundoNombre: segundoNombre,
      primerApellido: primerApellido,
      segundoApellido: segundoApellido,
      email: user.email,
      telefono: user.phone || '',
      direccion: user.address || '',
      especialidad: user.specialty || '',
      isAdmin: user.role === 'admin', // Establecer si es admin basado en el rol actual
      // Datos del contacto de emergencia simplificados
      contactoNombre: emergencyContactName,
      contactoTelefono: user.emergencyContactPhone || '',
    });
    setIsEditModalOpen(true);
  };

  // Función para cerrar el modal de edición
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditFormData({
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      email: "",
      telefono: "",
      direccion: "",
      especialidad: "",
      isAdmin: false,
      contactoNombre: "",
      contactoTelefono: "",
    });
  };

  // Helper para obtener el parámetro de estado según el filtro actual
  const getCurrentEstadoFilter = (): boolean | undefined => {
    if (filterStatus === "active") return true;
    if (filterStatus === "inactive") return false;
    return undefined; // "all"
  };

  // Función para guardar los cambios
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);

      // Construir el payload según el tipo de usuario
      let payload: any = {};

      // Campos obligatorios siempre (aunque estén vacíos, enviarlos)
      payload.primer_nombre = editFormData.primerNombre || '';
      payload.primer_apellido = editFormData.primerApellido || '';
      
      // Campos opcionales solo si tienen valor
      if (editFormData.segundoNombre?.trim()) {
        payload.segundo_nombre = editFormData.segundoNombre.trim();
      }
      if (editFormData.segundoApellido?.trim()) {
        payload.segundo_apellido = editFormData.segundoApellido.trim();
      }
      if (editFormData.telefono?.trim()) {
        payload.telefono = editFormData.telefono.trim();
      }
      if (editFormData.direccion?.trim()) {
        payload.direccion = editFormData.direccion.trim();
      }

      // Agregar campos específicos según el tipo de usuario
      if (editingUser.role === 'doctor' || editingUser.role === 'admin') {
        payload.especialidad = editFormData.especialidad || '';
        payload.is_admin = editFormData.isAdmin; // Incluir el campo is_admin
        console.log('Payload para médico:', payload);
        await updateMedico(editingUser.rut, payload);
      } 
      else if (editingUser.role === 'caregiver') {
        // Para cuidadores, usar nombres de campos específicos
        const cuidadorPayload: any = {};
        cuidadorPayload.primer_nombre_cuidador = editFormData.primerNombre || '';
        cuidadorPayload.primer_apellido_cuidador = editFormData.primerApellido || '';
        if (editFormData.segundoNombre?.trim()) {
          cuidadorPayload.segundo_nombre_cuidador = editFormData.segundoNombre.trim();
        }
        if (editFormData.segundoApellido?.trim()) {
          cuidadorPayload.segundo_apellido_cuidador = editFormData.segundoApellido.trim();
        }
        if (editFormData.telefono?.trim()) {
          cuidadorPayload.telefono = editFormData.telefono.trim();
        }
        if (editFormData.direccion?.trim()) {
          cuidadorPayload.direccion = editFormData.direccion.trim();
        }
        console.log('Payload para cuidador:', cuidadorPayload);
        await updateCuidador(editingUser.rut, cuidadorPayload);
      }
      else if (editingUser.role === 'patient') {
        // Para pacientes, usar nombres de campos específicos
        const pacientePayload: any = {};
        pacientePayload.primer_nombre_paciente = editFormData.primerNombre || '';
        pacientePayload.primer_apellido_paciente = editFormData.primerApellido || '';
        if (editFormData.segundoNombre?.trim()) {
          pacientePayload.segundo_nombre_paciente = editFormData.segundoNombre.trim();
        }
        if (editFormData.segundoApellido?.trim()) {
          pacientePayload.segundo_apellido_paciente = editFormData.segundoApellido.trim();
        }
        if (editFormData.telefono?.trim()) {
          pacientePayload.telefono = editFormData.telefono.trim();
        }
        if (editFormData.direccion?.trim()) {
          pacientePayload.direccion = editFormData.direccion.trim();
        }
        // Datos del contacto de emergencia
        pacientePayload.nombre_contacto = editFormData.contactoNombre || '';
        pacientePayload.telefono_contacto = editFormData.contactoTelefono || '';
        console.log('Payload para paciente:', pacientePayload);
        await updatePaciente(editingUser.rut, pacientePayload);
      }

      // Recargar la lista de usuarios después de la actualización
      console.log('Recargando lista de usuarios desde la API...');
      
      // Pequeño delay para asegurar que el backend haya terminado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Forzar recarga completa desde la API
      setUsers([]);
      setTotalUsers(0);
      
      // Recargar todos los usuarios desde la API respetando el filtro actual
      await loadAllSystemUsers(getCurrentEstadoFilter());
      
      console.log('Lista de usuarios recargada exitosamente desde la API');
      
      // Cerrar el modal
      handleCloseEditModal();

      // Mostrar mensaje de éxito
      console.log('Usuario actualizado exitosamente');

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      showError(error instanceof Error ? error.message : 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  // Función para activar/desactivar médico o administrador
  const handleToggleMedicoStatus = async (rut: string, currentStatus: string) => {
    try {
      setLoading(true);
      
      // Invertir el estado actual
      const newStatus = currentStatus === 'active';
      
      console.log(`Cambiando estado de médico ${rut} a: ${!newStatus ? 'activo' : 'inactivo'}`);
      
      await toggleMedicoStatus(rut, !newStatus);
      
      // Recargar la lista después del cambio respetando el filtro actual
      console.log('Recargando lista después del cambio de estado...');
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadAllSystemUsers(getCurrentEstadoFilter());
      
      console.log('Estado del médico actualizado exitosamente');
      
    } catch (error) {
      console.error('Error al cambiar estado del médico:', error);
      showError(error instanceof Error ? error.message : 'Error al cambiar estado del médico');
    } finally {
      setLoading(false);
    }
  };

  // Función para activar/desactivar cuidador
  const handleToggleCuidadorStatus = async (rut: string, currentStatus: string) => {
    try {
      setLoading(true);
      
      const newStatus = currentStatus === 'active';
      
      console.log(`Cambiando estado de cuidador ${rut} a: ${!newStatus ? 'activo' : 'inactivo'}`);
      
      await toggleCuidadorStatus(rut, !newStatus);
      
      // Recargar la lista después del cambio respetando el filtro actual
      console.log('Recargando lista después del cambio de estado...');
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadAllSystemUsers(getCurrentEstadoFilter());
      
      console.log('Estado del cuidador actualizado exitosamente');
      
    } catch (error) {
      console.error('Error al cambiar estado del cuidador:', error);
      showError(error instanceof Error ? error.message : 'Error al cambiar estado del cuidador');
    } finally {
      setLoading(false);
    }
  };

  // Función para activar/desactivar paciente
  const handleTogglePacienteStatus = async (rut: string, currentStatus: string) => {
    try {
      setLoading(true);
      
      const newStatus = currentStatus === 'active';
      
      console.log(`Cambiando estado de paciente ${rut} a: ${!newStatus ? 'activo' : 'inactivo'}`);
      
      await togglePacienteStatus(rut, !newStatus);
      
      // Recargar la lista después del cambio respetando el filtro actual
      console.log('Recargando lista después del cambio de estado...');
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadAllSystemUsers(getCurrentEstadoFilter());
      
      console.log('Estado del paciente actualizado exitosamente');
      
    } catch (error) {
      console.error('Error al cambiar estado del paciente:', error);
      showError(error instanceof Error ? error.message : 'Error al cambiar estado del paciente');
    } finally {
      setLoading(false);
    }
  };

  // Función unificada para activar/desactivar cualquier tipo de usuario
  const handleToggleUserStatus = async (user: UnifiedUser) => {
    switch (user.role) {
      case 'doctor':
      case 'admin':
        await handleToggleMedicoStatus(user.rut, user.status);
        break;
      case 'caregiver':
        await handleToggleCuidadorStatus(user.rut, user.status);
        break;
      case 'patient':
        await handleTogglePacienteStatus(user.rut, user.status);
        break;
      default:
        console.error('Tipo de usuario no reconocido:', user.role);
    }
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
        // Priorizar mensaje específico del servicio sobre transformaciones genéricas
        const errorMessage = result.message || (result.details ? niceMedicoMsg(result.details) : "Error creando el médico.");
        return showError(errorMessage, "No se pudo crear");
      }

      // Éxito: cerrar modal y resetear formulario
      setIsCreateUserOpen(false);
      resetForm();
      setLoading(false);
      
      // Recargar todos los usuarios
      await loadAllSystemUsers();
      
      // Opcionalmente mostrar mensaje de éxito (puedes agregar un toast aquí)
      console.log("✅ Médico/administrador creado exitosamente");
      
    } catch (e: any) {
      setLoading(false);
      showError(e?.message || "Error inesperado al crear usuario.", "Error inesperado");
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
              <SelectItem value="all">Todos los usuarios</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="doctor">Médicos</SelectItem>
              <SelectItem value="caregiver">Cuidadores</SelectItem>
              <SelectItem value="patient">Pacientes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(value: string) => setFilterStatus(value)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Solo Activos</SelectItem>
              <SelectItem value="inactive">Solo Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {loadingUsers ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando usuarios del sistema...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">RUT: {user.rut}</p>
                    {user.specialty && <p className="text-xs text-gray-400">Especialidad: {user.specialty}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant={getRoleColor(user.role)}>{roleLabel(user.role)}</Badge>
                  <Badge variant={getStatusColor(user.status)}>{statusLabel(user.status)}</Badge>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      aria-label="Editar usuario"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {/* Botón para activar/desactivar para TODOS los tipos de usuario */}
                    <Button 
                      variant={user.status === 'active' ? 'destructive' : 'default'} 
                      size="sm" 
                      aria-label={user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                      onClick={() => handleToggleUserStatus(user)}
                      disabled={loading}
                    >
                      {user.status === 'active' ? 'Desactivar' : 'Activar'}
                    </Button>
                    
                    <Button variant="outline" size="sm" aria-label="Eliminar usuario">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controles de paginación */}
        {!loadingUsers && totalUsers > usersPerPage && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Página {currentPage} - Mostrando {users.length} de {totalUsers} usuarios
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center space-x-1">
                {currentPage > 2 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)}>1</Button>
                    {currentPage > 3 && <span className="text-gray-400">...</span>}
                  </>
                )}
                {currentPage > 1 && (
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)}>
                    {currentPage - 1}
                  </Button>
                )}
                <Button variant="default" size="sm" disabled>
                  {currentPage}
                </Button>
                {Math.ceil(totalUsers / usersPerPage) > currentPage && (
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)}>
                    {currentPage + 1}
                  </Button>
                )}
                {Math.ceil(totalUsers / usersPerPage) > currentPage + 1 && (
                  <>
                    {Math.ceil(totalUsers / usersPerPage) > currentPage + 2 && <span className="text-gray-400">...</span>}
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.ceil(totalUsers / usersPerPage))}>
                      {Math.ceil(totalUsers / usersPerPage)}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalUsers / usersPerPage)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de edición de usuario */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent 
          className="p-0 flex flex-col"
          style={{ 
            width: '95vw', 
            maxWidth: '800px', 
            height: '80vh', 
            maxHeight: '90vh' 
          }}
        >
          <DialogHeader className="flex-shrink-0 p-3 pb-2">
            <DialogTitle className="text-lg">Editar Usuario</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 min-h-0">
            <div className="space-y-3 py-2">{editingUser && (
              <>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{editingUser.name}</p>
                    <p className="text-sm text-gray-600">RUT: {editingUser.rut}</p>
                    <Badge variant={getRoleColor(editingUser.role)} className="text-xs">
                      {roleLabel(editingUser.role)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-primer-nombre">Primer Nombre</Label>
                    <Input
                      id="edit-primer-nombre"
                      value={editFormData.primerNombre}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, primerNombre: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-segundo-nombre">Segundo Nombre</Label>
                    <Input
                      id="edit-segundo-nombre"
                      value={editFormData.segundoNombre}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, segundoNombre: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-primer-apellido">Primer Apellido</Label>
                    <Input
                      id="edit-primer-apellido"
                      value={editFormData.primerApellido}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, primerApellido: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-segundo-apellido">Segundo Apellido</Label>
                    <Input
                      id="edit-segundo-apellido"
                      value={editFormData.segundoApellido}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, segundoApellido: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">El email no se puede modificar</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-telefono">Teléfono</Label>
                  <Input
                    id="edit-telefono"
                    value={editFormData.telefono}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-direccion">Dirección</Label>
                  <Input
                    id="edit-direccion"
                    value={editFormData.direccion}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  />
                </div>

                {(editingUser.role === 'doctor' || editingUser.role === 'admin') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="edit-especialidad">Especialidad</Label>
                      <Input
                        id="edit-especialidad"
                        value={editFormData.especialidad}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, especialidad: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-is-admin"
                        checked={editFormData.isAdmin}
                        onCheckedChange={(checked: boolean) => setEditFormData(prev => ({ ...prev, isAdmin: !!checked }))}
                      />
                      <Label htmlFor="edit-is-admin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        ¿Es Administrador?
                      </Label>
                    </div>
                  </>
                )}

                {editingUser.role === 'patient' && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-3">Contacto de Emergencia</h4>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="edit-contacto-nombre">Nombre Completo</Label>
                          <Input
                            id="edit-contacto-nombre"
                            value={editFormData.contactoNombre}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, contactoNombre: e.target.value }))}
                            placeholder="Nombre completo del contacto de emergencia"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-contacto-telefono">Teléfono</Label>
                          <Input
                            id="edit-contacto-telefono"
                            value={editFormData.contactoTelefono}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, contactoTelefono: e.target.value }))}
                            placeholder="Teléfono del contacto de emergencia"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 p-3 pt-2 border-t bg-white">
            <Button variant="outline" onClick={handleCloseEditModal} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

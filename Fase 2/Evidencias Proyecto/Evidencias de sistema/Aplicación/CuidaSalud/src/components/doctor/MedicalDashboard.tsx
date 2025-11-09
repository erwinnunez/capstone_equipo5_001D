// src/components/doctor/MedicalDashboard.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import {
  AlertTriangle, Clock, User, Phone, Calendar, Activity, Heart, Stethoscope,
  CheckCircle, XCircle, PlayCircle, Bell, BellRing, Eye, UserCheck, AlertCircle,
  MapPin, Shield, Droplet, Loader2, Search
} from "lucide-react";
import { toast } from "sonner";

// Modal (shadcn)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

// === Medición
import {
  listarMedicionesConAlerta, listarMediciones, tomarMedicion, resolverMedicion, ignorarMedicion,
  type MedicionOut, type Page as PageMed, type EstadoAlerta, type MedicionDetalleOut,
  listMedicionDetalles as listMedicionDetallesFromMedSvc,
} from "../../services/medicion";

// === Paciente
import { getPacientes, getPacienteByRut } from "../../services/paciente";

// === Rangos del paciente
import { listRangosPaciente, type RangoPacienteOut } from "../../services/rangoPaciente";

/* ============================
   Helpers de debug
   ============================ */
const DEBUG_MED = true;
function dbg(...args: any[]) { if (DEBUG_MED) console.log("[MED]", ...args); }

/* ============================
   RUT del médico autenticado (robusto, prioriza sesión)
   ============================ */
function extractRutFromObject(obj: any): number | null {
  if (!obj) return null;
  const cands = [
    obj?.medico?.rut_medico,
    obj?.rut_medico,
    obj?.rutMedico,
    obj?.rut,
    obj?.user?.rut_medico,
    obj?.user?.rutMedico,
    obj?.user?.rut,
    obj?.user?.id,
    obj?.id,
  ];
  for (const c of cands) {
    if (c != null && !Number.isNaN(Number(c))) return Number(c);
  }
  return null;
}

/** Devuelve {rut, source} para logging */
function getLoggedMedicoRut(): { rut: string | null; source: string } {
  // 1) Revisar sesión
  const sessionStr = localStorage.getItem("session");
  if (sessionStr) {
    try {
      const s = JSON.parse(sessionStr);
      const rut = extractRutFromObject(s);
      if (rut != null) return { rut: String(rut), source: "session" };
    } catch {}
  }

  // 2) Revisar otras claves típicas de usuario
  for (const k of ["auth", "user", "current_user", "front_user"]) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      const rut = extractRutFromObject(obj);
      if (rut != null) return { rut: String(rut), source: k };
    } catch {}
  }

  // 3) Revisar JWT
  const jwt = localStorage.getItem("token") || localStorage.getItem("jwt");
  if (jwt && jwt.split(".").length === 3) {
    try {
      const payloadJson = atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"));
      const p = JSON.parse(payloadJson);
      const rut =
        p?.rut_medico ??
        p?.rutMedico ??
        p?.sub_rut ??
        p?.subRut ??
        p?.rut ??
        p?.id ??
        null;
      if (rut != null) return { rut: String(rut), source: "jwt" };
    } catch {}
  }

  // 4) Último recurso: clave suelta 'medico_rut'
  const direct = localStorage.getItem("medico_rut");
  if (direct) return { rut: String(direct), source: "medico_rut" };

  return { rut: null, source: "none" };
}



/* Tipos UI */
interface PatientUI {
  rut: string;
  name: string;
  age?: number;
  gender?: "M" | "F";
  phone?: string;
  diagnosis?: string;
  lastContact?: string;
  riskLevel?: "alto" | "medio" | "bajo";
  avatar?: string;
  bloodType?: string | null;
  insurance?: string | null;
  address?: string | null;
}
interface AlertUI {
  id: string;
  patientId: string;
  type: "vital_signs" | "symptoms" | "medication" | "emergency" | "lab_results";
  title: string;
  description: string;
  priority: "crítica" | "alta" | "media" | "baja";
  status: EstadoAlerta;
  timestamp: Date;
  assignedTo?: string;
  resolvedAt?: Date | null;
  ignoredAt?: Date | null;
}

/* Helpers UI */
const getPriorityColor = (p: string) =>
  p === "crítica" ? "destructive" : p === "alta" ? "secondary" : "outline";
const getStatusColor = (s: EstadoAlerta) =>
  s === "nueva" ? "destructive" : s === "en_proceso" ? "secondary" : "outline";
const getStatusIcon = (s: EstadoAlerta) =>
  s === "nueva" ? <Bell className="h-4 w-4" /> :
    s === "en_proceso" ? <PlayCircle className="h-4 w-4" /> :
      s === "resuelta" ? <CheckCircle className="h-4 w-4" /> :
        s === "ignorada" ? <XCircle className="h-4 w-4" /> : <Bell className="h-4 w-4" />;
const getTypeIcon = (t: string) =>
  t === "vital_signs" ? <Activity className="h-4 w-4" /> :
    t === "symptoms" ? <AlertCircle className="h-4 w-4" /> :
      t === "medication" ? <Heart className="h-4 w-4" /> :
        t === "emergency" ? <AlertTriangle className="h-4 w-4" /> :
          t === "lab_results" ? <Stethoscope className="h-4 w-4" /> : <Bell className="h-4 w-4" />;

const formatTimestamp = (d: Date) => {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000); const h = Math.floor(diff / 3600000); const day = Math.floor(diff / 86400000);
  if (m < 60) return `${m}m`; if (h < 24) return `${h}h`; return `${day}d`;
};

/* Mappers */
function normalizeSeverityToPriority(severidad_max: string): AlertUI["priority"] {
  const s = (severidad_max || "").toLowerCase();
  if (s.includes("critic")) return "crítica";
  if (s.includes("alta")) return "alta";
  if (s.includes("media")) return "media";
  if (s.includes("baja")) return "baja";
  return "alta";
}
function mapMedicionToAlert(m: MedicionOut): AlertUI {
  return {
    id: String(m.id_medicion),
    patientId: String(m.rut_paciente),
    type: "vital_signs",
    title: m.severidad_max || "Alerta de medición",
    description: m.resumen_alerta || m.observacion || "Alerta registrada",
    priority: normalizeSeverityToPriority(m.severidad_max),
    status: m.estado_alerta ?? "nueva",
    timestamp: new Date(m.fecha_registro),
    assignedTo: m.tomada_por != null ? String(m.tomada_por) : undefined,
    resolvedAt: (m as any).resuelta_en ? new Date((m as any).resuelta_en) : null,
    ignoredAt: (m as any).ignorada_en ? new Date((m as any).ignorada_en) : null,
  };
}
function toPatientUI(p: any): PatientUI {
  const rut = String(p?.rut_paciente ?? p?.rut ?? "");
  const name = [p?.primer_nombre_paciente, p?.segundo_nombre_paciente, p?.primer_apellido_paciente, p?.segundo_apellido_paciente]
    .filter(Boolean).join(" ").trim() || (rut ? `RUT ${rut}` : "Paciente");
  let age: number | undefined;
  if (p?.fecha_nacimiento) {
    const dob = new Date(p.fecha_nacimiento);
    if (!isNaN(dob.getTime())) age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
  }
  return {
    rut, name, age,
    gender: p?.sexo === true ? "M" : p?.sexo === false ? "F" : undefined,
    phone: p?.telefono ? String(p.telefono) : undefined,
    diagnosis: p?.enfermedades ?? undefined,
    bloodType: p?.tipo_de_sangre ?? null,
    insurance: p?.seguro ?? null,
    address: p?.direccion ?? null,
  };
}

/* Param helpers */
function getParamNameById(id?: number | null) {
  switch (id) {
    case 1: return "Glucosa";
    case 2: return "Presión Sistólica";
    case 3: return "Saturación O₂";
    case 4: return "Temperatura";
    case 5: return "Presión Diastólica";
    default: return null;
  }
}
function prettyParamName(tipo?: string | null) {
  const t = (tipo || "").toUpperCase();
  if (t.includes("GLUC")) return "Glucosa";
  if (t.includes("SIS")) return "Presión Sistólica";
  if (t.includes("DIA")) return "Presión Diastólica";
  if (t.includes("SPO2") || t.includes("OXI")) return "Saturación O₂";
  if (t.includes("TEMP")) return "Temperatura";
  return null;
}
function getParamName(det: MedicionDetalleOut) {
  return getParamNameById(det.id_parametro) || prettyParamName(det.tipo_alerta) || "Parámetro";
}

/* Rango helpers */
function isVigente(fechaISO: string, r: RangoPacienteOut) {
  const t = new Date(fechaISO).getTime();
  const d = r.vigencia_desde ? new Date(r.vigencia_desde).getTime() : -Infinity;
  const h = r.vigencia_hasta ? new Date(r.vigencia_hasta).getTime() : Infinity;
  return t >= d && t <= h;
}
function chooseRangeFor(
  rangos: RangoPacienteOut[] | undefined,
  id_parametro: number,
  fechaMedicionISO: string
): RangoPacienteOut | undefined {
  if (!rangos?.length) return undefined;
  const cands = rangos.filter(r => r.id_parametro === id_parametro && isVigente(fechaMedicionISO, r));
  if (cands.length === 0) return undefined;
  cands.sort((a, b) => {
    const va = a.version ?? 0, vb = b.version ?? 0;
    if (vb !== va) return vb - va;
    return (b.vigencia_desde ? new Date(b.vigencia_desde).getTime() : 0)
      - (a.vigencia_desde ? new Date(a.vigencia_desde).getTime() : 0);
  });
  return cands[0];
}

/* Component */
export default function MedicalDashboard() {
  const [alerts, setAlerts] = useState<AlertUI[]>([]);
  const [selected, setSelected] = useState<AlertUI | null>(null);
  const [open, setOpen] = useState(false);
  const [patientsByRut, setPatientsByRut] = useState<Map<string, PatientUI>>(new Map());
  const [detallesByMed, setDetallesByMed] = useState<Record<string, MedicionDetalleOut[]>>({});
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  const [rangosByRut, setRangosByRut] = useState<Record<string, RangoPacienteOut[]>>({});
  const [medicosByRut, setMedicosByRut] = useState<Record<string, string>>({});

  const [filter, setFilter] = useState<"todas" | "nuevas" | "proceso" | "críticas">("todas");
  const [filtroNombre, setFiltroNombre] = useState<string>("");
  const latestIdsRef = useRef<Set<string>>(new Set());

  // obtenemos rut + source (para debug)
  const { rut: medicoRut, source: medicoRutSource } = getLoggedMedicoRut();

  const [actionLoading, setActionLoading] =
    useState<Record<string, "take" | "resolve" | "ignore" | null>>({});

  // Init doctor name desde auth (sin fijar medico_rut en localStorage)
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "null");
      const name = auth?.user?.name ?? auth?.name ?? null;
      if (name && medicoRut != null) setMedicosByRut(prev => ({ ...prev, [String(medicoRut)]: String(name) }));
    } catch {}
    dbg("medicoRut detectado", medicoRut, {
      source: medicoRutSource,
      medico_rut: localStorage.getItem("medico_rut"),
      session: localStorage.getItem("session"),
      auth: localStorage.getItem("auth"),
      user: localStorage.getItem("user"),
      token: localStorage.getItem("token") ? "sí" : "no",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ensureDoctorName(rutStr: string) {
    if (!rutStr || medicosByRut[rutStr]) return;
    if (medicoRut != null && rutStr === String(medicoRut)) {
      try {
        const auth = JSON.parse(localStorage.getItem("auth") || "null");
        const name = auth?.user?.name ?? auth?.name ?? null;
        if (name) return setMedicosByRut(prev => ({ ...prev, [rutStr]: String(name) }));
      } catch {}
    }
    const cacheKeys = ["medicosByRut", "medicos_cache", "doctors_cache"];
    for (const k of cacheKeys) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const map = JSON.parse(raw);
        const name = map?.[rutStr];
        if (typeof name === "string" && name.trim()) {
          setMedicosByRut(prev => ({ ...prev, [rutStr]: name.trim() }));
          return;
        }
      } catch {}
    }
  }
  useEffect(() => {
    const ruts = Array.from(new Set(alerts.map(a => a.assignedTo).filter(Boolean))) as string[];
    ruts.forEach(r => { void ensureDoctorName(r); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts]);

  /* Pacientes base */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data: any = await getPacientes<any>();
        const arr: any[] = Array.isArray(data) ? data : (data?.items ?? []);
        if (cancelled) return;
        const m = new Map<string, PatientUI>();
        for (const p of arr ?? []) {
          const pui = toPatientUI(p);
          if (pui.rut) m.set(pui.rut, pui);
        }
        setPatientsByRut(m);
      } catch (e: any) {
        toast.error("No se pudieron cargar los pacientes", { description: e?.message ?? "Error" });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Alertas + polling */
  useEffect(() => {
    let cancelled = false;
    async function load(page = 1, page_size = 50) {
      try {
        let items: MedicionOut[] = [];
        const resp1 = await listarMedicionesConAlerta(page, page_size, {});
        if (resp1.ok) items = (resp1.data as PageMed<MedicionOut>).items ?? [];
        if (!resp1.ok || items.length === 0) {
          const resp2 = await listarMediciones(page, page_size, true);
          if (resp2.ok) items = (resp2.data as PageMed<MedicionOut>).items ?? [];
          else if (!resp1.ok) throw new Error(resp1.message);
        }
        const mapped = items.map(mapMedicionToAlert)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        if (cancelled) return;

        const prev = latestIdsRef.current;
        const current = new Set(mapped.map(a => a.id));
        const newOnes = mapped.filter(a => !prev.has(a.id));
        if (prev.size > 0 && newOnes.length > 0) {
          const first = newOnes[0];
          const label = patientsByRut.get(first.patientId)?.name ?? `RUT ${first.patientId}`;
          toast.info("Nueva alerta recibida", { description: `${label}: ${first.title}` });
        }
        latestIdsRef.current = current;
        setAlerts(mapped);
      } catch (e: any) {
        toast.error("No se pudieron cargar las alertas", { description: e?.message ?? "Error" });
      }
    }
    load();
    const iv = setInterval(() => load(), 30000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [patientsByRut]);

  /* Rangos por paciente */
  async function ensureRangos(rutStr: string) {
    if (rangosByRut[rutStr]) return;
    try {
      const page = await listRangosPaciente({ rut_paciente: String(rutStr), page_size: 500 });
      setRangosByRut(prev => ({ ...prev, [rutStr]: page.items ?? [] }));
    } catch (e: any) {
      toast.error("No se pudieron cargar rangos del paciente", { description: e?.message ?? "Error" });
    }
  }

  /* Cargar detalles/ficha cuando cambia selected (para el modal) */
  useEffect(() => {
    if (!selected) return;
    const key = selected.id;
    const rut = selected.patientId;
    let cancelled = false;
    (async () => {
      try {
        if (!detallesByMed[key]) {
          setLoadingDetalles(true);
          const page: any = await listMedicionDetallesFromMedSvc({
            id_medicion: Number(selected.id), page: 1, page_size: 100,
          });
          if (!cancelled) {
            const items: MedicionDetalleOut[] = page?.data?.items ?? page?.items ?? [];
            setDetallesByMed(prev => ({ ...prev, [key]: items }));
          }
        }
        if (!patientsByRut.has(rut)) {
          try {
            const ficha = await getPacienteByRut(String(rut));
            if (!cancelled) {
              setPatientsByRut(prev => {
                const copy = new Map(prev);
                copy.set(rut, toPatientUI(ficha));
                return copy;
              });
            }
          } catch {}
        }
        await ensureRangos(rut);
        if (selected.assignedTo) void ensureDoctorName(selected.assignedTo);
      } finally {
        if (!cancelled) setLoadingDetalles(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  /* Filtro */
  const filteredAlerts = useMemo(() => {
    try {
      return alerts.filter(a => {
        if (a.status === "resuelta" || a.status === "ignorada") return false;
        
        // Filtro por estado
        let passStatusFilter = false;
        switch (filter) {
          case "nuevas": passStatusFilter = a.status === "nueva"; break;
          case "proceso": passStatusFilter = a.status === "en_proceso"; break;
          case "críticas": passStatusFilter = a.priority === "crítica"; break;
          default: passStatusFilter = true;
        }
        
        if (!passStatusFilter) return false;
        
        // Filtro por nombre de paciente
        if (filtroNombre && filtroNombre.trim() && patientsByRut) {
          try {
            const patient = patientsByRut.get(a.patientId);
            const patientName = patient?.name?.toLowerCase() || a.patientId.toLowerCase();
            const searchTerm = filtroNombre.toLowerCase().trim();
            
            if (!patientName.includes(searchTerm)) {
              return false;
            }
          } catch (error) {
            console.warn('Error filtering patient by name:', error);
            return true; // En caso de error, mostrar la alerta
          }
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error in filteredAlerts:', error);
      return alerts; // Retornar todas las alertas en caso de error
    }
  }, [alerts, filter, filtroNombre, patientsByRut]);

  /* Guards & acciones */
  const isTakenByOther = (a: AlertUI) => !!a.assignedTo && medicoRut != null && a.assignedTo !== String(medicoRut);
  const canTake = (a: AlertUI) => a.status === "nueva" && (!a.assignedTo || !isTakenByOther(a));
  const canResolve = (a: AlertUI) =>
    a.status === "en_proceso" && !!a.assignedTo && medicoRut != null && a.assignedTo === String(medicoRut);
  const canIgnore = canResolve;
  const isLoading = (id: string, kind: "take" | "resolve" | "ignore") => actionLoading[id] === kind;
  const setLoading = (id: string, k: "take" | "resolve" | "ignore" | null) =>
    setActionLoading(prev => ({ ...prev, [id]: k }));

  async function handleTakeAlert(alertId: string) {
    const a = alerts.find(x => x.id === alertId);
    if (!medicoRut) return toast.error("No hay RUT de médico en sesión.");
    if (!a) return;
    if (!canTake(a)) return toast.info("Esta alerta ya fue tomada por otro médico.");

    try {
      setLoading(alertId, "take");
      const resp = await tomarMedicion(Number(alertId), medicoRut);
      if (!resp.ok) throw new Error(resp.message);
      const updated = mapMedicionToAlert(resp.data);
      setAlerts(prev => prev.map(x => (x.id === alertId ? updated : x)));
      setSelected(prev => (prev && prev.id === alertId ? updated : prev));
      if (updated.assignedTo) void ensureDoctorName(updated.assignedTo);
      toast.success("Alerta tomada");
    } catch (e: any) {
      toast.error("No se pudo tomar la alerta", { description: e?.message ?? "Error" });
    } finally {
      setLoading(alertId, null);
    }
  }
  async function handleResolveAlert(alertId: string) {
    const a = alerts.find(x => x.id === alertId);
    if (!a) return;
    if (!canResolve(a)) return toast.info("Solo el médico asignado puede resolver esta alerta.");
    try {
      setLoading(alertId, "resolve");
      const resp = await resolverMedicion(Number(alertId));
      if (!resp.ok) throw new Error(resp.message);
      const updated = mapMedicionToAlert(resp.data);
      setAlerts(prev => prev.map(x => (x.id === alertId ? updated : x)));
      setSelected(updated);
      toast.success("Alerta resuelta");
    } catch (e: any) {
      toast.error("No se pudo resolver la alerta", { description: e?.message ?? "Error" });
    } finally { setLoading(alertId, null); }
  }
  async function handleIgnoreAlert(alertId: string) {
    const a = alerts.find(x => x.id === alertId);
    if (!a) return;
    if (!canIgnore(a)) return toast.info("Solo el médico asignado puede ignorar esta alerta.");
    try {
      setLoading(alertId, "ignore");
      const resp = await ignorarMedicion(Number(alertId));
      if (!resp.ok) throw new Error(resp.message);
      const updated = mapMedicionToAlert(resp.data);
      setAlerts(prev => prev.map(x => (x.id === alertId ? updated : x)));
      setSelected(updated);
      toast.info("Alerta ignorada");
    } catch (e: any) {
      toast.error("No se pudo ignorar la alerta", { description: e?.message ?? "Error" });
    } finally { setLoading(alertId, null); }
  }

  /* KPIs */
  const criticalCount = alerts.filter(a => a.priority === "crítica" && a.status !== "resuelta" && a.status !== "ignorada").length;
  const newCount = alerts.filter(a => a.status === "nueva").length;
  const inProcessCount = alerts.filter(a => a.status === "en_proceso").length;

  /* Lookup */
  const findPatient = (rutId: string) => patientsByRut.get(rutId);

  /* Row detalle de medición (tile) */
  function renderDetalleRow(d: MedicionDetalleOut) {
    const rangos = rangosByRut[selected!.patientId];
    const vigente = chooseRangeFor(rangos, d.id_parametro, selected!.timestamp.toISOString());
    const min = vigente?.min_normal ?? d.umbral_min ?? undefined;
    const max = vigente?.max_normal ?? d.umbral_max ?? undefined;
    const outOfRange =
      d.fuera_rango ||
      (typeof d.valor_num === "number" && ((min != null && d.valor_num < min) || (max != null && d.valor_num > max)));
    const title = getParamName(d);

    return (
      <Card key={d.id_detalle} className={`border ${outOfRange ? "border-destructive/40 shadow-sm" : "border-border"}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{title}</p>
              {(min != null || max != null) && (
                <p className="text-xs text-muted-foreground">umbral {min ?? "—"} – {max ?? "—"}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">
                {typeof d.valor_num === "number" ? d.valor_num : d.valor_texto ?? "—"}
              </p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <Badge variant={outOfRange ? "destructive" : "outline"}>
                  {d.severidad?.toLowerCase() || (outOfRange ? "alerta" : "normal")}
                </Badge>
                {outOfRange ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Qué parámetro disparó la alerta
  const firedLabel = useMemo(() => {
    if (!selected) return null;
    const dets = detallesByMed[selected.id] ?? [];
    const firstOut = dets.find((d) => {
      const rangos = rangosByRut[selected.patientId];
      const vigente = chooseRangeFor(rangos, d.id_parametro, selected.timestamp.toISOString());
      const min = vigente?.min_normal ?? d.umbral_min ?? undefined;
      const max = vigente?.max_normal ?? d.umbral_max ?? undefined;
      if (typeof d.valor_num === "number") {
        if (min != null && d.valor_num < min) return true;
        if (max != null && d.valor_num > max) return true;
      }
      return d.fuera_rango;
    });
    return firstOut ? getParamName(firstOut) : null;
  }, [selected, detallesByMed, rangosByRut]);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Panel de KPIs + Alertas */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div><p className="text-sm font-medium">Críticas</p><p className="text-2xl font-bold text-destructive">{criticalCount}</p></div>
          </div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2">
            <BellRing className="h-5 w-5" />
            <div><p className="text-sm font-medium">Nuevas</p><p className="text-2xl font-bold">{newCount}</p></div>
          </div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2">
            <PlayCircle className="h-5 w-5" />
            <div><p className="text-sm font-medium">En Proceso</p><p className="text-2xl font-bold">{inProcessCount}</p></div>
          </div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <div><p className="text-sm font-medium">Pacientes</p><p className="text-2xl font-bold">{patientsByRut.size}</p></div>
          </div></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Alertas Activas</CardTitle>
              <div className="flex gap-2">
                <Button variant={filter === "todas" ? "default" : "outline"} size="sm" onClick={() => setFilter("todas")}>Todas</Button>
                <Button variant={filter === "críticas" ? "default" : "outline"} size="sm" onClick={() => setFilter("críticas")}>Críticas</Button>
                <Button variant={filter === "nuevas" ? "default" : "outline"} size="sm" onClick={() => setFilter("nuevas")}>Nuevas</Button>
                <Button variant={filter === "proceso" ? "default" : "outline"} size="sm" onClick={() => setFilter("proceso")}>En Proceso</Button>
              </div>
            </div>
            {/* Filtro por nombre de paciente */}
            <div className="flex items-center gap-2 mt-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de paciente..."
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                className="max-w-sm"
              />
              {filtroNombre && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiltroNombre("")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-320px)] md:h-[600px]">
              <div className="space-y-3">
                {filteredAlerts.map((a) => {
                  const patient = findPatient(a.patientId);
                  const doctorName = a.assignedTo ? (medicosByRut[a.assignedTo] ?? `Médico ${a.assignedTo}`) : null;
                  const takeDisabled = !canTake(a) || isLoading(a.id, "take");
                  return (
                    <Card
                      key={a.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${a.priority === "crítica" ? "border-destructive" : ""}`}
                      onClick={() => { setSelected(a); setOpen(true); }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex-shrink-0">{getTypeIcon(a.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-medium text-sm truncate">{patient ? patient.name : `RUT ${a.patientId}`}</p>
                                <Badge variant={getPriorityColor(a.priority)} className="text-xs">{a.priority}</Badge>
                                <Badge variant={getStatusColor(a.status)} className="text-xs">{getStatusIcon(a.status)}{a.status.replace("_", " ")}</Badge>
                                {a.assignedTo && <Badge variant="secondary" className="text-xs">{doctorName}</Badge>}
                              </div>
                              <p className="font-medium text-sm mb-1">{a.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                              {isTakenByOther(a) && <p className="text-xs text-muted-foreground mt-1">Ya fue tomada por otro médico.</p>}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <Clock className="h-3 w-3" />{formatTimestamp(a.timestamp)}
                            </div>
                            <Button
                              size="sm"
                              disabled={takeDisabled}
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                setSelected(a);
                                setOpen(true); // abre modal, no desaparece el botón
                              }}
                            >
                              {isLoading(a.id, "take") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Tomar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No hay alertas para el filtro seleccionado</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* === MODAL: alerta a la IZQUIERDA, paciente a la DERECHA === */}
      {selected && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="w-auto sm:max-w-[980px] lg:max-w-[1120px] p-0 overflow-hidden"
            onOpenAutoFocus={(e: Event) => e.preventDefault()}
          >
            {/* Header */}
            <DialogHeader className="px-6 pt-5 pb-3 bg-muted/30 border-b">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Eye className="h-5 w-5" />
                    Detalles de la alerta
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {(() => {
                      const p = findPatient(selected.patientId);
                      return (
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium">
                            {p?.name ?? `RUT ${selected.patientId}`}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span>{selected.timestamp.toLocaleString("es-CL")}</span>
                        </div>
                      );
                    })()}
                  </DialogDescription>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Badge variant={getPriorityColor(selected.priority)}>{selected.priority}</Badge>
                  <Badge variant={getStatusColor(selected.status)}>
                    {getStatusIcon(selected.status)}
                    {selected.status.replace("_", " ")}
                  </Badge>
                  {selected.assignedTo && (
                    <Badge variant="secondary">
                      {medicosByRut[selected.assignedTo] ?? `Médico ${selected.assignedTo}`}
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Contenido principal: IZQ (alerta) / DER (paciente) */}
            <div className="flex flex-col sm:flex-row gap-0">
              {/* Columna izquierda - Alerta */}
              <div className="w-full sm:w-1/2 lg:w-7/12 sm:border-r bg-muted/20">
                <ScrollArea className="max-h-[72vh] sm:max-h-[75vh]">
                  <div className="px-6 py-5 space-y-5">
                    <div className="space-y-1">
                      <h4 className="font-semibold leading-tight">{selected.title}</h4>
                      <p className="text-sm text-muted-foreground">{selected.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">Disparó la alerta:</span>
                      {firedLabel ? (
                        <Badge variant="outline" className="text-xs">{firedLabel}</Badge>
                      ) : (
                        <span>—</span>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <h5 className="font-medium text-sm">Registros de esta medición</h5>
                        {loadingDetalles && <span className="text-xs text-muted-foreground">Cargando…</span>}
                      </div>

                      {(detallesByMed[selected.id] ?? []).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(detallesByMed[selected.id] ?? []).map((d) => renderDetalleRow(d))}
                        </div>
                      ) : (
                        !loadingDetalles && (
                          <p className="text-sm text-muted-foreground">No hay detalles para esta medición.</p>
                        )
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Columna derecha - Paciente */}
              <div className="w-full sm:w-1/2 lg:w-5/12">
                <ScrollArea className="max-h-[72vh] sm:max-h-[75vh]">
                  <div className="px-6 py-5 space-y-5">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <h5 className="font-medium text-sm">Información del Paciente</h5>
                    </div>

                    {(() => {
                      const p = findPatient(selected.patientId);
                      if (!p) {
                        return (
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar><AvatarFallback>PT</AvatarFallback></Avatar>
                                <div>
                                  <p className="font-medium">RUT {selected.patientId}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Paciente sin ficha local
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                      const initials = p.name.split(" ").map(n => n[0]).join("").substring(0, 2);
                      return (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={p.avatar ?? undefined} />
                                <AvatarFallback>{initials || "PT"}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium">{p.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {p.age ? `${p.age} años, ` : ""}
                                  {p.gender === "M" ? "Masculino" : p.gender === "F" ? "Femenino" : "—"}
                                </p>
                              </div>
                            </div>

                            <Separator className="my-3" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{p.phone ?? "—"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                <span>{p.diagnosis ?? "—"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Droplet className="h-4 w-4" />
                                <span>Tipo de sangre: {p.bloodType ?? "—"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span>Seguro: {p.insurance ?? "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 sm:col-span-2">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">{p.address ?? "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 sm:col-span-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Último contacto:{" "}
                                  {p.lastContact
                                    ? new Date(p.lastContact).toLocaleDateString("es-CL")
                                    : "—"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 sm:col-span-2">
                                <AlertTriangle className="h-4 w-4" />
                                <Badge
                                  variant={p.riskLevel === "alto"
                                    ? "destructive"
                                    : p.riskLevel === "medio"
                                      ? "secondary"
                                      : "outline"}
                                >
                                  Riesgo {p.riskLevel ?? "—"}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}

                    {/* Acciones rápidas */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Acciones rápidas</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Button variant="outline" onClick={() => toast.message("Llamar paciente")}>
                            <Phone className="mr-2 h-4 w-4" /> Llamar
                          </Button>
                          <Button variant="outline" onClick={() => toast.message("Ver ficha")}>
                            <User className="mr-2 h-4 w-4" /> Ver ficha
                          </Button>
                          <Button variant="outline" className="sm:col-span-2" onClick={() => toast.message("Agendar control")}>
                            <Calendar className="mr-2 h-4 w-4" /> Agendar control
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:px-6 border-t bg-background flex flex-col md:flex-row gap-2 md:gap-3 md:justify-end">
              <div className="flex-1 md:flex-none text-xs text-muted-foreground md:text-right">
                {selected.assignedTo
                  ? `Asignada a: ${medicosByRut[selected.assignedTo] ?? selected.assignedTo}`
                  : "Sin asignar"}
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={!canTake(selected) || isLoading(selected.id, "take")}
                  onClick={() => handleTakeAlert(selected.id)}
                >
                  {isLoading(selected.id, "take") ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  Tomar
                </Button>
                <Button
                  variant="default"
                  disabled={!canResolve(selected) || isLoading(selected.id, "resolve")}
                  onClick={() => handleResolveAlert(selected.id)}
                >
                  {isLoading(selected.id, "resolve") ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Resolver
                </Button>
                <Button
                  variant="outline"
                  disabled={!canIgnore(selected) || isLoading(selected.id, "ignore")}
                  onClick={() => handleIgnoreAlert(selected.id)}
                >
                  {isLoading(selected.id, "ignore") ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Ignorar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

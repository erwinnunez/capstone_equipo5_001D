// src/components/doctor/MedicalDashboard.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import {
  AlertTriangle, Clock, User, Phone, Calendar, Activity, Heart, Stethoscope,
  CheckCircle, XCircle, PlayCircle, Bell, BellRing, Eye, UserCheck, AlertCircle,
  MapPin, Shield, Droplet, Loader2
} from "lucide-react";
import { toast } from "sonner";

// === Medición
import {
  listarMedicionesConAlerta, listarMediciones, tomarMedicion, resolverMedicion, ignorarMedicion,
  type MedicionOut, type Page as PageMed, type EstadoAlerta, type MedicionDetalleOut,
  listMedicionDetalles as listMedicionDetallesFromMedSvc,
} from "../../services/medicion";

// === Paciente
import { getPacientes, getPacienteByRut, type Page as PagePac } from "../../services/paciente";

// === Rangos del paciente (tu service)
import {
  listRangosPaciente,
  type RangoPacienteOut,
} from "../../services/rangoPaciente";

/* RUT del médico autenticado */
function getLoggedMedicoRut(): number | null {
  const rutFromStorage = localStorage.getItem("medico_rut");
  if (rutFromStorage) {
    const n = Number(rutFromStorage);
    if (!Number.isNaN(n)) return n;
  }
  const sessionStr = localStorage.getItem("session");
  if (sessionStr) {
    try {
      const s = JSON.parse(sessionStr);
      if (s?.medico?.rut_medico) return Number(s.medico.rut_medico);
      if (s?.rut_medico) return Number(s.rut_medico);
    } catch {}
  }
  const jwt = localStorage.getItem("token") || localStorage.getItem("jwt");
  if (jwt && jwt.split(".").length === 3) {
    try {
      const payloadJson = atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"));
      const p = JSON.parse(payloadJson);
      if (p?.rut_medico) return Number(p.rut_medico);
      if (p?.sub_rut || p?.rut) return Number(p.sub_rut ?? p.rut);
    } catch {}
  }
  return null;
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

/* Nombres de parámetros por id (ajusta si tu catálogo cambia) */
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

/* Vigencia: algunos TS tuyos ponen vigencias opcionales => toleramos null */
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
  const [patientsByRut, setPatientsByRut] = useState<Map<string, PatientUI>>(new Map());
  const [detallesByMed, setDetallesByMed] = useState<Record<string, MedicionDetalleOut[]>>({});
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // 🔹 Rangos cacheados por RUT
  const [rangosByRut, setRangosByRut] = useState<Record<string, RangoPacienteOut[]>>({});

  const [filter, setFilter] = useState<"todas" | "nuevas" | "proceso" | "críticas">("todas");
  const latestIdsRef = useRef<Set<string>>(new Set());
  const medicoRut = getLoggedMedicoRut();
  const [actionLoading, setActionLoading] =
    useState<Record<string, "take" | "resolve" | "ignore" | null>>({});

  /* Pacientes base */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data: any[] = await getPacientes<any[]>();
        if (cancelled) return;
        const m = new Map<string, PatientUI>();
        for (const p of data ?? []) {
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

  /* Cargar rangos del paciente si no están */
  async function ensureRangos(rutStr: string) {
    if (rangosByRut[rutStr]) return;
    try {
      const page = await listRangosPaciente({ rut_paciente: Number(rutStr), page_size: 500 });
      setRangosByRut(prev => ({ ...prev, [rutStr]: page.items ?? [] }));
    } catch (e: any) {
      toast.error("No se pudieron cargar rangos del paciente", { description: e?.message ?? "Error" });
    }
  }

  /* Al seleccionar: detalles, ficha y rangos */
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
            const ficha = await getPacienteByRut<any>(Number(rut));
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
      } finally {
        if (!cancelled) setLoadingDetalles(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  /* Filtro */
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      switch (filter) {
        case "nuevas": return a.status === "nueva";
        case "proceso": return a.status === "en_proceso";
        case "críticas": return a.priority === "crítica";
        default: return a.status !== "ignorada";
      }
    });
  }, [alerts, filter]);

  /* Guards & acciones */
  const isTakenByOther = (a: AlertUI) => !!a.assignedTo && medicoRut != null && a.assignedTo !== String(medicoRut);
  const canTake = (a: AlertUI) => a.status === "nueva" && (!a.assignedTo || !isTakenByOther(a));
  const canResolve = (a: AlertUI) => a.status === "en_proceso" && !!a.assignedTo && medicoRut != null && a.assignedTo === String(medicoRut);
  const canIgnore = canResolve;
  const isLoading = (id: string, kind: "take" | "resolve" | "ignore") => actionLoading[id] === kind;
  const setLoading = (id: string, k: "take" | "resolve" | "ignore" | null) =>
    setActionLoading(prev => ({ ...prev, [id]: k }));

  async function handleTakeAlert(alertId: string) {
    if (!medicoRut) return toast.error("No se pudo tomar la alerta", { description: "No hay RUT de médico en sesión." });
    const a = alerts.find(x => x.id === alertId); if (!a) return;
    if (!canTake(a)) return toast.info("Esta alerta ya fue tomada por otro médico.");

    try {
      setLoading(alertId, "take");
      const resp = await tomarMedicion(Number(alertId), medicoRut);
      if (!resp.ok) throw new Error(resp.message);
      const updated = mapMedicionToAlert(resp.data);
      setAlerts(prev => prev.map(x => (x.id === alertId ? updated : x)));
      setSelected(prev => (prev && prev.id === alertId ? updated : prev));
      toast.success("Alerta tomada");
    } catch (e: any) {
      toast.error("No se pudo tomar la alerta", { description: e?.message ?? "Error" });
    } finally {
      setLoading(alertId, null);
    }
  }
  async function handleResolveAlert(alertId: string) {
    const a = alerts.find(x => x.id === alertId); if (!a) return;
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
    const a = alerts.find(x => x.id === alertId); if (!a) return;
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

  /* Render fila de detalle (con rangos de BD si existen) */
  function renderDetalleRow(d: MedicionDetalleOut) {
    const rangos = rangosByRut[selected!.patientId];
    const vigente = chooseRangeFor(rangos, d.id_parametro, selected!.timestamp.toISOString());
    const min = vigente?.min_normal ?? d.umbral_min ?? undefined;
    const max = vigente?.max_normal ?? d.umbral_max ?? undefined;

    const outOfRange =
      d.fuera_rango ||
      (typeof d.valor_num === "number" &&
        ((min != null && d.valor_num < min) || (max != null && d.valor_num > max)));

    const title = getParamName(d);

    return (
      <div
        key={d.id_detalle}
        className={`grid grid-cols-12 gap-2 items-center rounded-md p-3 border ${
          outOfRange ? "border-destructive/50 bg-destructive/5" : "border-border"
        }`}
      >
        <div className="col-span-6 md:col-span-4 text-sm">
          <span className="font-medium">{title}</span>
          {(min != null || max != null) && (
            <span className="block text-xs text-muted-foreground">
              umbral {min ?? "—"} – {max ?? "—"}
            </span>
          )}
        </div>

        <div className="col-span-4 md:col-span-5 text-sm">
          <span className="font-medium">
            {typeof d.valor_num === "number" ? d.valor_num : d.valor_texto ?? "—"}
          </span>
        </div>

        <div className="col-span-2 md:col-span-2 flex justify-end">
          <Badge variant={outOfRange ? "destructive" : "outline"}>
            {d.severidad?.toLowerCase() || (outOfRange ? "alerta" : "normal")}
          </Badge>
        </div>

        <div className="col-span-12 md:col-span-1 flex md:justify-end">
          {outOfRange ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4" />}
        </div>
      </div>
    );
  }

  /* Qué parámetro disparó la alerta */
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel alertas */}
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div><p className="text-sm font-medium">Críticas</p><p className="text-2xl font-bold text-destructive">{criticalCount}</p></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BellRing className="h-5 w-5 text-orange-500" />
              <div><p className="text-sm font-medium">Nuevas</p><p className="text-2xl font-bold text-orange-500">{newCount}</p></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-blue-500" />
              <div><p className="text-sm font-medium">En Proceso</p><p className="text-2xl font-bold text-blue-500">{inProcessCount}</p></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <div><p className="text-sm font-medium">Pacientes</p><p className="text-2xl font-bold text-green-500">{patientsByRut.size}</p></div>
            </div>
          </CardContent></Card>
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
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredAlerts.map((a) => {
                  const patient = findPatient(a.patientId);
                  const takeDisabled = !canTake(a) || isLoading(a.id, "take");
                  return (
                    <Card
                      key={a.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selected?.id === a.id ? "ring-2 ring-primary" : ""
                      } ${a.priority === "crítica" ? "border-destructive" : ""}`}
                      onClick={() => setSelected(a)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between space-x-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0">{getTypeIcon(a.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-medium text-sm truncate">{patient ? patient.name : `RUT ${a.patientId}`}</p>
                                <Badge variant={getPriorityColor(a.priority)} className="text-xs">{a.priority}</Badge>
                                <Badge variant={getStatusColor(a.status)} className="text-xs">{getStatusIcon(a.status)}{a.status.replace("_", " ")}</Badge>
                                {a.assignedTo && <Badge variant="secondary" className="text-xs">{`Tomada por ${a.assignedTo}`}</Badge>}
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
                            {a.status === "nueva" && (
                              <Button size="sm" disabled={takeDisabled} onClick={(e) => { e.stopPropagation(); handleTakeAlert(a.id); }}>
                                {isLoading(a.id, "take") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Tomar
                              </Button>
                            )}
                            {a.status === "en_proceso" && a.assignedTo && (
                              <Badge variant="secondary" className="text-xs">{a.assignedTo}</Badge>
                            )}
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

      {/* Panel de Detalles */}
      <div className="space-y-4">
        {selected ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Detalles de la Alerta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getPriorityColor(selected.priority)}>{selected.priority}</Badge>
                  <Badge variant={getStatusColor(selected.status)}>{getStatusIcon(selected.status)}{selected.status.replace("_", " ")}</Badge>
                  {selected.assignedTo && <Badge variant="secondary">{`Tomada por ${selected.assignedTo}`}</Badge>}
                </div>

                <div>
                  <h4 className="font-medium mb-1">{selected.title}</h4>
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />{selected.timestamp.toLocaleString("es-CL")}
                </div>

                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-medium">Disparó la alerta:</span>
                  {firedLabel ? <Badge variant="outline" className="text-xs">{firedLabel}</Badge> : <span>—</span>}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <h5 className="font-medium text-sm">Registros de esta medición</h5>
                    {loadingDetalles && <span className="text-xs text-muted-foreground">Cargando…</span>}
                  </div>

                  {(detallesByMed[selected.id] ?? []).length > 0 ? (
                    <div className="space-y-2">
                      {(detallesByMed[selected.id] ?? []).map((d) => renderDetalleRow(d))}
                    </div>
                  ) : (
                    !loadingDetalles && <p className="text-sm text-muted-foreground">No hay detalles para esta medición.</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  {selected.status === "nueva" && (
                    <Button className="w-full" disabled={!canTake(selected) || isLoading(selected.id, "take")} onClick={() => handleTakeAlert(selected.id)}>
                      {isLoading(selected.id, "take") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                      Tomar Alerta
                    </Button>
                  )}

                  {(selected.status === "en_proceso" || selected.status === "nueva") && (
                    <>
                      <Button className="w-full" variant="default" disabled={!canResolve(selected) || isLoading(selected.id, "resolve")} onClick={() => handleResolveAlert(selected.id)}>
                        {isLoading(selected.id, "resolve") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Resolver
                      </Button>

                      <Button className="w-full" variant="outline" disabled={!canIgnore(selected) || isLoading(selected.id, "ignore")} onClick={() => handleIgnoreAlert(selected.id)}>
                        {isLoading(selected.id, "ignore") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                        Ignorar
                      </Button>

                      {!canResolve(selected) && selected.status === "en_proceso" && (
                        <p className="text-xs text-muted-foreground text-center">Solo el médico asignado puede resolver o ignorar.</p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ficha paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Información del Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const p = findPatient(selected.patientId);
                  if (!p) {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Avatar><AvatarFallback>PT</AvatarFallback></Avatar>
                          <div>
                            <p className="font-medium">RUT {selected.patientId}</p>
                            <p className="text-sm text-muted-foreground">Paciente sin ficha local</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4" /><span>—</span></div>
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>—</span></div>
                          <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /><Badge variant="outline">Riesgo —</Badge></div>
                        </div>
                        <Button className="w-full" variant="outline" disabled><Phone className="mr-2 h-4 w-4" /> Llamar Paciente</Button>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={p.avatar} />
                          <AvatarFallback>{p.name.split(" ").map(n => n[0]).join("").substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {p.age ? `${p.age} años, ` : ""}{p.gender === "M" ? "Masculino" : p.gender === "F" ? "Femenino" : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>{p.phone ?? "—"}</span></div>
                        <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4" /><span>{p.diagnosis ?? "—"}</span></div>
                        <div className="flex items-center gap-2"><Droplet className="h-4 w-4" /><span>Tipo de sangre: {p.bloodType ?? "—"}</span></div>
                        <div className="flex items-center gap-2"><Shield className="h-4 w-4" /><span>Seguro: {p.insurance ?? "—"}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{p.address ?? "—"}</span></div>
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Último contacto: {p.lastContact ? new Date(p.lastContact).toLocaleDateString("es-CL") : "—"}</span></div>
                        <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />
                          <Badge variant={p.riskLevel === "alto" ? "destructive" : p.riskLevel === "medio" ? "secondary" : "outline"}>Riesgo {p.riskLevel ?? "—"}</Badge>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline"><Phone className="mr-2 h-4 w-4" /> Llamar Paciente</Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card><CardContent className="p-8 text-center text-muted-foreground">
            <Eye className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Selecciona una alerta para ver los detalles</p>
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}

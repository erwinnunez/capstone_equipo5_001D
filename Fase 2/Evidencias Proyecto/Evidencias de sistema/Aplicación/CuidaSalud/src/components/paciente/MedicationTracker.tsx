// src/components/paciente/MedicationTracker.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";
import { Pill, Clock, CheckCircle, AlertTriangle, Calendar, Info } from "lucide-react";

import {
  listMedicinaDetalles,
  getMedicina,
  patchMedicinaDetalleTomada,
  type MedicinaOut,
  type MedicinaDetalleOut,
} from "../../services/medicacion";

interface MedicationTrackerProps {
  onBack: () => void;
  rutPaciente?: number;
}

interface MedicationUI {
  id_detalle: number;
  id_medicina: number;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  overdue: boolean;      // pasó la hora y no está tomada
  pending: boolean;      // aún no llega la hora
  finished: boolean;     // fecha_fin < hoy (fin inclusivo por día)
  finishesToday?: boolean;
  frequency: string;
  instructions: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  tomada_en?: string | null;
}

// ---- helpers de fechas ----
const toDate = (iso?: string | null) => (iso ? new Date(iso) : null);
const fmtTime = (iso?: string | null) => {
  try {
    const d = toDate(iso);
    if (!d) return "—";
    return d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
};
const fmtDate = (iso?: string | null) => {
  try {
    const d = toDate(iso);
    if (!d) return "";
    return d.toLocaleDateString("es-CL");
  } catch {
    return "";
  }
};

// fechas solo por DÍA en UTC (para “fin inclusivo”)
const todayUTC = () => {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
};
const toUTCDateOnly = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};
const isFinishedByDate = (finIso?: string | null) => {
  const fin = toUTCDateOnly(finIso);
  if (fin == null) return false;
  return todayUTC() > fin; // fin es inclusivo
};
const finishesToday = (finIso?: string | null) => {
  const fin = toUTCDateOnly(finIso);
  if (fin == null) return false;
  return todayUTC() === fin;
};
// ¿está activa ahora por RANGO DE DÍAS?
const isActiveNowByDay = (startIso?: string | null, endIso?: string | null) => {
  const ini = toUTCDateOnly(startIso);
  if (ini == null) return false;
  const fin = toUTCDateOnly(endIso);
  const t = todayUTC();
  return ini <= t && (fin == null || t <= fin);
};

export default function MedicationTracker({ onBack, rutPaciente }: MedicationTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [medications, setMedications] = useState<MedicationUI[]>([]);

  // --- Cargar prescripciones y quedarse con la MÁS RECIENTE por id_medicina ---
  useEffect(() => {
    if (!rutPaciente) return;
    let ignore = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const det = await listMedicinaDetalles({
          rut_paciente: rutPaciente,
          page: 1,
          page_size: 500,
        });
        const detalles = det.items ?? [];

        // 1) ordena por fecha más reciente (inicio || fin)
        const sorted = [...detalles].sort((a, b) => {
          const ta =
            toDate(a.fecha_inicio)?.getTime() ??
            toDate(a.fecha_fin ?? null)?.getTime() ??
            0;
          const tb =
            toDate(b.fecha_inicio)?.getTime() ??
            toDate(b.fecha_fin ?? null)?.getTime() ??
            0;
          return tb - ta; // más recientes primero
        });

        // 2) último registro por id_medicina
        const latestByMed = new Map<number, MedicinaDetalleOut>();
        for (const d of sorted) {
          if (!latestByMed.has(d.id_medicina)) latestByMed.set(d.id_medicina, d);
        }
        const visibles = Array.from(latestByMed.values());

        // 3) obtener info de cada medicina
        const uniqIds = Array.from(new Set(visibles.map((d) => d.id_medicina)));
        const medsList = await Promise.all(uniqIds.map((id) => getMedicina(id)));
        const idxById = new Map<number, MedicinaOut>(medsList.map((m) => [m.id_medicina, m]));

        const now = new Date();

        // 4) mapear a UI
        const ui: MedicationUI[] = visibles
          .map((d) => {
            const med = idxById.get(d.id_medicina);
            const name = med?.nombre ?? `Medicina #${d.id_medicina}`;
            const dosage = d.dosis ? `${d.dosis}` : med?.toma_maxima ?? "";
            const start = toDate(d.fecha_inicio);
            const end = toDate(d.fecha_fin ?? null);

            const taken = d.tomada === true;
            const finished = isFinishedByDate(d.fecha_fin); // fin inclusivo por día
            const overdue = !taken && !!start && start < now && !finished;
            const pending = !taken && !!start && start > now;

            return {
              id_detalle: d.id_detalle,
              id_medicina: d.id_medicina,
              name,
              dosage,
              time: fmtTime(d.fecha_inicio),
              taken,
              overdue,
              pending,
              finished,
              finishesToday: finishesToday(d.fecha_fin),
              frequency: d.instrucciones_toma ?? med?.toma_maxima ?? "—",
              instructions: med?.instrucciones ?? "—",
              fecha_inicio: d.fecha_inicio,
              fecha_fin: d.fecha_fin ?? null,
              tomada_en: (d as any).tomada_en ?? null,
            };
          })
          .sort((a, b) => {
            const da = toDate(a.fecha_inicio)?.getTime() ?? 0;
            const db = toDate(b.fecha_inicio)?.getTime() ?? 0;
            return db - da;
          });

        if (!ignore) setMedications(ui);
      } catch (e: any) {
        if (!ignore) setErr(e?.message ?? "No se pudo cargar la medicación");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [rutPaciente]);

  // --- Métricas: activas por rango de días (no por hora) ---
  const activeNowItems = useMemo(
    () => medications.filter((m) => isActiveNowByDay(m.fecha_inicio, m.fecha_fin)),
    [medications]
  );
  const todaysTaken = activeNowItems.filter((m) => m.taken).length;
  const todaysTotal = activeNowItems.length;
  const adherenceRate = Math.round((todaysTaken / (todaysTotal || 1)) * 100);
  const missedMeds = activeNowItems.filter((m) => m.overdue);

  // --- Acciones ---
  const mark = async (id_detalle: number, tomada: boolean) => {
    try {
      const updated = await patchMedicinaDetalleTomada(
        id_detalle,
        tomada,
        new Date().toISOString() // enviamos cuándo se tomó
      );
      setMedications((prev) =>
        prev.map((m) => {
          if (m.id_detalle !== id_detalle) return m;
          const start = toDate(m.fecha_inicio);
          const end = toDate(m.fecha_fin ?? null);
          const now = new Date();
          const finished = isFinishedByDate(m.fecha_fin);
          return {
            ...m,
            taken: updated.tomada,
            tomada_en: (updated as any).tomada_en ?? m.tomada_en,
            finished,
            overdue: !updated.tomada && !!start && start < now && !finished,
            pending: !updated.tomada && !!start && start > now,
          };
        })
      );
    } catch (e: any) {
      alert(e?.message ?? "No se pudo actualizar el estado de la medicación");
    }
  };

  const handleMarkTaken = (id_detalle: number) => mark(id_detalle, true);
  const handleMarkMissed = (id_detalle: number) => mark(id_detalle, false);

  // --- Render helpers ---
  const stateBadge = (m: MedicationUI) => {
    if (m.taken)
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Tomada
        </Badge>
      );
    if (m.finished) return <Badge variant="outline">Finalizada</Badge>;
    if (m.overdue) return <Badge variant="destructive">Atrasada</Badge>;
    if (m.pending) return <Badge className="bg-blue-100 text-blue-700">Pendiente</Badge>;
    return <Badge variant="outline">Sin estado</Badge>;
  };

  const statusLine = (m: MedicationUI) => {
    const finTxt = m.fecha_fin ? ` • Finaliza: ${fmtDate(m.fecha_fin)}` : "";
    if (m.taken) {
      const when = m.tomada_en ? fmtTime(m.tomada_en) : m.time;
      return `Tomada a las ${when}${finTxt}`;
    }
    if (m.finished) return `Finalizada el ${fmtDate(m.fecha_fin)} • Programada: ${m.time || "—"}`;
    if (m.overdue) return `Hora pasada (${m.time})${finTxt}`;
    if (m.pending) return `Programada para las ${m.time}${finTxt}`;
    return `Programación: ${m.time || "—"}${finTxt}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-500" />
            Control de Medicación
          </CardTitle>
          <CardDescription>
            Se muestra el plan más reciente por medicina. Puedes registrar la toma incluso si ya
            pasó la hora (quedará como &quot;Atrasada&quot;).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && <p className="text-sm text-red-600">{err}</p>}
          {loading && <p className="text-sm text-muted-foreground">Cargando medicación…</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{todaysTaken}</div>
              <div className="text-sm text-green-700">Tomadas (activas ahora)</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{adherenceRate}%</div>
              <div className="text-sm text-blue-700">Adherencia (activas ahora)</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{missedMeds.length}</div>
              <div className="text-sm text-amber-700">Atrasadas (activas ahora)</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso actual</span>
              <span>
                {todaysTaken}/{todaysTotal}
              </span>
            </div>
            <Progress value={(todaysTaken / (todaysTotal || 1)) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {activeNowItems.some((m) => m.overdue) && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Medicaciones atrasadas:</strong> Tienes {missedMeds.length} pendiente(s) cuya
            hora ya pasó.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {medications.map((m) => (
          <Card
            key={m.id_detalle}
            className={`${
              m.taken
                ? "border-green-200 bg-green-50"
                : m.finished && !m.finishesToday
                ? "border-zinc-200 bg-zinc-50"
                : m.overdue
                ? "border-red-200 bg-red-50"
                : m.pending
                ? "border-blue-200 bg-blue-50"
                : "border-border"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        m.taken
                          ? "bg-green-100 text-green-600"
                          : m.finished && !m.finishesToday
                          ? "bg-zinc-100 text-zinc-600"
                          : m.overdue
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{m.name}</h4>
                      <p className="text-sm text-muted-foreground">{m.dosage}</p>
                    </div>
                    {stateBadge(m)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {m.time} — {m.frequency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>{m.instructions}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">{statusLine(m)}</p>
                </div>

                {/* Mostrar botón si NO está tomada y (no ha finalizado o finaliza HOY) */}
                {!m.taken && (!m.finished || m.finishesToday) && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkMissed(m.id_detalle)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Marcar como no tomada
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMarkTaken(m.id_detalle)}
                      className="bg-green-600 hover:bg-green-700"
                      title={
                        m.overdue || m.finishesToday
                          ? "Se registrará la toma (si pasó la hora, quedará como atrasada)"
                          : undefined
                      }
                    >
                      {m.overdue || m.finishesToday ? "Registrar toma (atrasada)" : "Marcar tomada"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && medications.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {rutPaciente
              ? "No hay registros de medicación."
              : "Debes iniciar sesión para ver tu medicación."}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Consejos para la adherencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p>
              • <strong>Establece alarmas:</strong> Usa tu teléfono para recordatorios
            </p>
            <p>
              • <strong>Rutina fija:</strong> Toma medicamentos a la misma hora diaria
            </p>
            <p>
              • <strong>Organizador semanal:</strong> Prepara las dosis con anticipación
            </p>
            <p>
              • <strong>No omitas dosis:</strong> Si olvidas una, consulta las instrucciones
            </p>
            <p>
              • <strong>Comunica problemas:</strong> Habla con tu médico sobre efectos secundarios
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Volver al inicio
        </Button>
        <Button className="flex-1">Compartir con médico</Button>
      </div>
    </div>
  );
}

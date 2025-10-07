// src/components/paciente/PatientProgress.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { recentMeasurements } from '../../data/patientMock';

import {
  listMediciones,
  listMedicionDetalles,
  type Page,
  type MedicionOut,
  type MedicionDetalleOut,
} from '../../services/paciente.ts';

export default function PatientProgress({
  currentStreak,
  totalPoints,
  rutPaciente,
}: {
  currentStreak: number;
  totalPoints: number;
  rutPaciente?: number;
}) {
  // Fallback: si no viene prop, intenta obtener de localStorage (rut_paciente)
  const effectiveRut =
    rutPaciente ??
    (typeof window !== 'undefined' ? Number(localStorage.getItem('rut_paciente')) : undefined);

  // ----- estado listado mediciones -----
  const [meds, setMeds] = useState<MedicionOut[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canLoadMore = meds.length < total;

  useEffect(() => {
    if (!effectiveRut) return;
    setLoading(true);
    setError(null);
    listMediciones({ rut_paciente: effectiveRut, page: 1, page_size: pageSize })
      .then((res) => {
        setMeds(res.items ?? []);
        setTotal(res.total ?? 0);
        setPage(res.page ?? 1);
      })
      .catch(() => setError('Error cargando mediciones'))
      .finally(() => setLoading(false));
  }, [effectiveRut, pageSize]);

  const loadMore = () => {
    if (!effectiveRut) return;
    const next = page + 1;
    setLoading(true);
    listMediciones({ rut_paciente: effectiveRut, page: next, page_size: pageSize })
      .then((res) => {
        setMeds((prev) => [...prev, ...(res.items ?? [])]);
        setTotal(res.total ?? total);
        setPage(res.page ?? next);
      })
      .catch(() => setError('Error cargando más mediciones'))
      .finally(() => setLoading(false));
  };

  // helpers UI
  const sevColor = (sev: string): 'outline' | 'secondary' | 'destructive' => {
    const s = (sev || '').toLowerCase();
    if (s === 'high' || s === 'critical') return 'destructive';
    if (s === 'medium' || s === 'warning') return 'secondary';
    return 'outline';
  };
  const boolText = (b: boolean) => (b ? 'Sí' : 'No');
  const formatDateTime = (d: string | Date) => {
    try {
      const dt = typeof d === 'string' ? new Date(d) : d;
      return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(dt);
    } catch {
      return String(d ?? '');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del progreso</CardTitle>
        <CardDescription>
          Realice un seguimiento de su progreso en materia de salud a lo largo del tiempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{currentStreak}</div>
            <p className="text-sm text-blue-600">Racha de días</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
            <p className="text-sm text-green-600">Puntos totales</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">85%</div>
            <p className="text-sm text-purple-600">Metas con</p>
          </div>
        </div>

        {/* ======= Datatable de mediciones ======= */}
        {effectiveRut ? (
          <div className="mb-6 border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-semibold">Fecha</th>
                    <th className="px-3 py-2 font-semibold">Origen</th>
                    <th className="px-3 py-2 font-semibold">Registrado por</th>
                    <th className="px-3 py-2 font-semibold">Alerta</th>
                    <th className="px-3 py-2 font-semibold">Severidad</th>
                    <th className="px-3 py-2 font-semibold w-0">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && meds.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-3 text-center text-gray-600">
                        Cargando mediciones…
                      </td>
                    </tr>
                  )}
                  {error && meds.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-3 text-center text-destructive">
                        {error}
                      </td>
                    </tr>
                  )}
                  {!loading && !error && meds.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-3 text-center text-gray-600">
                        Sin mediciones registradas.
                      </td>
                    </tr>
                  )}

                  {meds.map((m) => (
                    <tr key={m.id_medicion} className="border-t">
                      <td className="px-3 py-2">{formatDateTime(m.fecha_registro)}</td>
                      <td className="px-3 py-2">{m.origen}</td>
                      <td className="px-3 py-2">{m.registrado_por}</td>
                      <td className="px-3 py-2">
                        <Badge variant={m.tiene_alerta ? 'destructive' : 'outline'}>
                          {boolText(m.tiene_alerta)}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={sevColor(m.severidad_max)}>{m.severidad_max}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <MedicionDetalleButton idMedicion={m.id_medicion} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer tabla */}
            <div className="flex items-center justify-between p-3 border-t">
              <div className="text-xs text-gray-600">
                {meds.length} de {total}
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={loadMore} disabled={!canLoadMore || loading}>
                  {loading ? 'Cargando…' : canLoadMore ? 'Cargar más' : 'No hay más'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 border rounded-lg bg-yellow-50 text-yellow-800 text-sm">
            No se encontró el RUT del paciente. Pásalo como prop <code>rutPaciente</code> o guarda
            <code> rut_paciente </code> en <code>localStorage</code>.
          </div>
        )}
        {/* ======= FIN datatable ======= */}

        {/* Gráfico */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={recentMeasurements}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bloodSugar" stroke="#3b82f6" strokeWidth={2} name="Blood Sugar" />
            <Line type="monotone" dataKey="bloodPressure" stroke="#ef4444" strokeWidth={2} name="Blood Pressure" />
            <Line type="monotone" dataKey="oxygen" stroke="#10b981" strokeWidth={2} name="Oxygen %" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Botón + diálogo para ver detalles de una medición
function MedicionDetalleButton({ idMedicion }: { idMedicion: number }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<MedicionDetalleOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setErr(null);
    listMedicionDetalles({ id_medicion: idMedicion, page: 1, page_size: 100 })
      .then((res) => setRows(res.items ?? []))
      .catch(() => setErr('Error cargando detalle de la medición'))
      .finally(() => setLoading(false));
  }, [open, idMedicion]);

  const renderValor = (d: MedicionDetalleOut) => {
    const anyD = d as any;
    const value = anyD.valor ?? d.valor_texto ?? d.valor_num ?? '-';
    const unidad = anyD.unidad ?? '';
    return `${value} ${unidad}`.trim();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Ver detalle</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[90vw] max-w-3xl overflow-auto">
        <DialogHeader>
          <DialogTitle>Detalle de medición #{idMedicion}</DialogTitle>
        </DialogHeader>

        {loading && <p>Cargando parámetros…</p>}
        {err && <p className="text-destructive">{err}</p>}

        {!loading && !err && (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-semibold">Parámetro</th>
                    <th className="px-3 py-2 font-semibold">Valor</th>
                    <th className="px-3 py-2 font-semibold">Severidad</th>
                    <th className="px-3 py-2 font-semibold">Fuera de rango</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-3 text-center text-gray-600">
                        No hay parámetros asociados.
                      </td>
                    </tr>
                  )}
                  {rows.map((d) => (
                    <tr key={d.id_detalle} className="border-t">
                      <td className="px-3 py-2">#{d.id_parametro}</td>
                      <td className="px-3 py-2">{renderValor(d)}</td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={
                            (d.severidad ?? 'normal') === 'critical'
                              ? 'destructive'
                              : (d.severidad === 'warning' ? 'secondary' : 'outline')
                          }
                        >
                          {d.severidad ?? 'normal'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">{d.fuera_rango ? 'Sí' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

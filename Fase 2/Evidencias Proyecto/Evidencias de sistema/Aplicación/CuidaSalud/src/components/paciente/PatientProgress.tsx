import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import {
  listMediciones,
  listMedicionDetalles,
  type MedicionOut,
  type MedicionDetalleOut,
} from '../../services/paciente.ts';

import {
  listParametrosClinicos,
  type ParametroClinicoOut,
} from '../../services/parametroClinico';

import {
  getGamificacionPerfil,
  getRecentMeasurementsForChart,
  type GamificacionPerfilOut,
} from '../../services/gamificacion';

interface Props {
  rutPaciente?: number; // <- viene del login (igual que en tu ejemplo)
}

export default function PatientProgress({ rutPaciente }: Props) {
  // ----- estado gamificación -----
  const [gamificacion, setGamificacion] = useState<GamificacionPerfilOut | null>(null);
  const [loadingGamificacion, setLoadingGamificacion] = useState(false);
  const [gamificacionError, setGamificacionError] = useState<string | null>(null);

  // ----- estado gráfica de tendencias -----
  const [recentMeasurements, setRecentMeasurements] = useState<Array<{
    date: string;
    bloodSugar?: number;
    bloodPressure?: number;
    oxygen?: number;
    temperature?: number;
    [key: string]: any;
  }>>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  // ----- estado listado mediciones -----
  const [meds, setMeds] = useState<MedicionOut[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canLoadMore = meds.length < total;

  // Cargar datos de gamificación y gráfica
  useEffect(() => {
    if (!rutPaciente) return;
    (async () => {
      try {
        setLoadingGamificacion(true);
        setLoadingChart(true);
        setGamificacionError(null);
        
        // Cargar gamificación y datos de gráfica en paralelo
        const [perfil, chartData] = await Promise.all([
          getGamificacionPerfil(String(rutPaciente)),
          getRecentMeasurementsForChart(String(rutPaciente), 7)
        ]);
        
        setGamificacion(perfil);
        setRecentMeasurements(chartData);
      } catch (e: any) {
        setGamificacionError(e?.message ?? 'No se pudieron cargar los datos de gamificación');
      } finally {
        setLoadingGamificacion(false);
        setLoadingChart(false);
      }
    })();
  }, [rutPaciente]);

  // Cargar mediciones
  useEffect(() => {
    if (!rutPaciente) return;
    setLoading(true);
    setError(null);
    listMediciones({ rut_paciente: String(rutPaciente), page: 1, page_size: pageSize })
      .then((res) => {
        setMeds(res.items ?? []);
        setTotal(res.total ?? 0);
        setPage(res.page ?? 1);
      })
      .catch(() => setError('Error cargando mediciones'))
      .finally(() => setLoading(false));
  }, [rutPaciente, pageSize]);

  const loadMore = () => {
    if (!rutPaciente) return;
    const next = page + 1;
    setLoading(true);
    listMediciones({ rut_paciente: String(rutPaciente), page: next, page_size: pageSize })
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
          {loadingGamificacion ? (
            <div className="col-span-3 text-center p-4 text-muted-foreground">
              Cargando datos de progreso...
            </div>
          ) : gamificacionError ? (
            <div className="col-span-3 text-center p-4 text-red-600">
              Error: {gamificacionError}
            </div>
          ) : gamificacion ? (
            <>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{gamificacion.racha_dias}</div>
                <p className="text-sm text-blue-600">Racha de días</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{gamificacion.puntos}</div>
                <p className="text-sm text-green-600">Puntos totales</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">-</div>
                <p className="text-sm text-purple-600">Metas cumplidas</p>
                <p className="text-xs text-purple-500 mt-1">Próximamente</p>
              </div>
            </>
          ) : (
            <div className="col-span-3 text-center p-4 text-muted-foreground">
              No hay datos de gamificación disponibles
            </div>
          )}
        </div>

        {/* ======= Datatable de mediciones ======= */}
        {rutPaciente ? (
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
          <p className="mb-6 text-sm text-amber-600">
            No se encontró el rut del paciente (<code>rutPaciente</code>). Asegúrate de pasarlo desde el Login.
          </p>
        )}
        {/* ======= FIN datatable ======= */}

        {/* Gráfico */}
        {loadingChart ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Cargando gráfica de tendencias...
          </div>
        ) : recentMeasurements.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No hay datos de mediciones recientes para mostrar
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={recentMeasurements}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('es-CL', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                }}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('es-CL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                }}
                formatter={(value, name) => [value, name]}
              />
              {/* Solo mostrar líneas para datos que existen */}
              {recentMeasurements.some(d => d.bloodSugar != null) && (
                <Line 
                  type="monotone" 
                  dataKey="bloodSugar" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  name="Glucosa" 
                  connectNulls={false}
                />
              )}
              {recentMeasurements.some(d => d.bloodPressure != null) && (
                <Line 
                  type="monotone" 
                  dataKey="bloodPressure" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  name="Presión Arterial" 
                  connectNulls={false}
                />
              )}
              {recentMeasurements.some(d => d.bloodPressureDia != null) && (
                <Line 
                  type="monotone" 
                  dataKey="bloodPressureDia" 
                  stroke="#a855f7" 
                  strokeWidth={2} 
                  name="Presión Diastólica" 
                  connectNulls={false}
                />
              )}
              {recentMeasurements.some(d => d.oxygen != null) && (
                <Line 
                  type="monotone" 
                  dataKey="oxygen" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  name="Oxígeno %" 
                  connectNulls={false}
                />
              )}
              {recentMeasurements.some(d => d.temperature != null) && (
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  name="Temperatura" 
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/* ===== Botón + diálogo para ver detalles de una medición ===== */
function MedicionDetalleButton({ idMedicion }: { idMedicion: number }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<MedicionDetalleOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // índice por id_parametro -> ParametroClinicoOut
  const [paramIndex, setParamIndex] = useState<Record<number, ParametroClinicoOut>>({});

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setErr(null);

    Promise.all([
      listMedicionDetalles({ id_medicion: idMedicion, page: 1, page_size: 100 }),
      listParametrosClinicos({ page_size: 200 }),
    ])
      .then(([detRes, pcRes]) => {
        setRows(detRes.items ?? []);
        const idx: Record<number, ParametroClinicoOut> = {};
        for (const p of pcRes.items ?? []) idx[p.id_parametro] = p;
        setParamIndex(idx);
      })
      .catch(() => setErr('Error cargando detalle de la medición'))
      .finally(() => setLoading(false));
  }, [open, idMedicion]);

  const renderValor = (d: MedicionDetalleOut) => {
    const anyD = d as any;
    const value = anyD.valor ?? d.valor_texto ?? d.valor_num ?? '-';
    const unidad = anyD.unidad ?? ''; // si ya viene incluido en valor_texto, quedará vacío
    return `${value} ${unidad}`.trim();
  };

  // Nombre amigable por código (fallback a descripción o "#id")
  const friendlyName = (p?: ParametroClinicoOut, id_parametro?: number) => {
    if (!p) return `#${id_parametro ?? ''}`;
    const code = (p.codigo || '').toUpperCase();
    const map: Record<string, string> = {
      GLUCOSA: 'Glucosa',
      PRESION: 'Presión sistólica',
      PRESION_DIAST: 'Presión diastólica',
      OXIGENO: 'Oxígeno en sangre',
      TEMP: 'Temperatura corporal',
    };
    return map[code] ?? p.descipcion ?? p.codigo ?? `#${p.id_parametro}`;
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
                  {rows.map((d) => {
                    const pc = paramIndex[d.id_parametro];
                    return (
                      <tr key={d.id_detalle} className="border-t">
                        <td className="px-3 py-2">
                          {friendlyName(pc, d.id_parametro)}
                        </td>
                        <td className="px-3 py-2">{renderValor(d)}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={
                              (d.severidad ?? 'normal') === 'critical'
                                ? 'destructive'
                                : d.severidad === 'warning'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {d.severidad ?? 'normal'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">{d.fuera_rango ? 'Sí' : 'No'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

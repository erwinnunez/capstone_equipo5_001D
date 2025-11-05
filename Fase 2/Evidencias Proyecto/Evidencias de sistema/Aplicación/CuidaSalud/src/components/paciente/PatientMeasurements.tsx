import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Plus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { createMedicionWithDetails } from '../../services/paciente';
import type { MedicionCreatePayload, Severidad } from '../../services/paciente';
import { listParametrosClinicos, type ParametroClinicoOut } from '../../services/parametroClinico';
import { getRangosIndexByParametro, type RangoPacienteOut } from '../../services/rangoPaciente';
import { getGamificacionPerfil, getWeeklyMeasurementProgress, getRecentMeasurementsForChart, type GamificacionPerfilOut } from '../../services/gamificacion';

interface Props {
  rutPaciente?: number;
}

export default function PatientMeasurements({ rutPaciente }: Props) {
  const [newMeasurement, setNewMeasurement] = useState({
    bloodSugar: '',
    bloodPressureSys: '',
    bloodPressureDia: '',
    oxygen: '',
    temperature: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [loadingParams, setLoadingParams] = useState(true);
  const [params, setParams] = useState<ParametroClinicoOut[]>([]);
  const [paramsError, setParamsError] = useState<string | null>(null);

  const [rangos, setRangos] = useState<Record<number, RangoPacienteOut>>({});
  const [rangosError, setRangosError] = useState<string | null>(null);
  const [loadingRangos, setLoadingRangos] = useState(false);

  // Estados para gamificación y metas semanales
  const [gamificacion, setGamificacion] = useState<GamificacionPerfilOut | null>(null);
  const [loadingGamificacion, setLoadingGamificacion] = useState(false);
  const [gamificacionError, setGamificacionError] = useState<string | null>(null);

  // Estados para progreso semanal
  const [weeklyProgress, setWeeklyProgress] = useState<{ weeklyProgress: number; weeklyGoal: number }>({ weeklyProgress: 0, weeklyGoal: 7 });
  const [loadingWeeklyProgress, setLoadingWeeklyProgress] = useState(false);

  // Estados para gráfica de tendencias
  const [recentMeasurements, setRecentMeasurements] = useState<Array<{
    date: string;
    bloodSugar?: number;
    bloodPressure?: number;
    oxygen?: number;
    temperature?: number;
    [key: string]: any;
  }>>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  // Carga parámetros clínicos
  useEffect(() => {
    (async () => {
      try {
        setLoadingParams(true);
        setParamsError(null);
        const page = await listParametrosClinicos({ page_size: 100 });
        setParams(page.items ?? []);
      } catch (e: any) {
        setParamsError(e?.message ?? 'No se pudieron cargar los parámetros clínicos');
      } finally {
        setLoadingParams(false);
      }
    })();
  }, []);

  // Carga rangos por paciente
  useEffect(() => {
    (async () => {
      if (!rutPaciente) return;
      try {
        setLoadingRangos(true);
        setRangosError(null);
        const idx = await getRangosIndexByParametro(String(rutPaciente));
        setRangos(idx);
      } catch (e: any) {
        setRangosError(e?.message ?? 'No se pudieron cargar los rangos del paciente');
      } finally {
        setLoadingRangos(false);
      }
    })();
  }, [rutPaciente]);

  // Carga datos de gamificación y progreso semanal
  useEffect(() => {
    (async () => {
      if (!rutPaciente) return;
      try {
        setLoadingGamificacion(true);
        setLoadingWeeklyProgress(true);
        setLoadingChart(true);
        setGamificacionError(null);
        
        // Cargar gamificación, progreso semanal y datos de gráfica en paralelo
        const [perfil, progreso, chartData] = await Promise.all([
          getGamificacionPerfil(String(rutPaciente)),
          getWeeklyMeasurementProgress(String(rutPaciente)),
          getRecentMeasurementsForChart(String(rutPaciente), 7)
        ]);
        
        setGamificacion(perfil);
        setWeeklyProgress(progreso);
        setRecentMeasurements(chartData);
      } catch (e: any) {
        setGamificacionError(e?.message ?? 'No se pudieron cargar los datos de gamificación');
      } finally {
        setLoadingGamificacion(false);
        setLoadingWeeklyProgress(false);
        setLoadingChart(false);
      }
    })();
  }, [rutPaciente]);

  // Mapa por código para encontrar IDs y unidades fácilmente
  const P = useMemo(() => {
    const byCode: Record<string, ParametroClinicoOut> = {};
    for (const it of params) if (it?.codigo) byCode[it.codigo.toUpperCase()] = it;
    return {
      byCode,
      GLUCOSA: byCode['GLUCOSA'],
      PRESION_SIS: byCode['PRESION'],
      PRESION_DIA: byCode['PRESION_DIAST'],
      OXIGENO: byCode['OXIGENO'],
      TEMP: byCode['TEMP'],
    };
  }, [params]);

  const parseNumber = (v: string) => {
    const n = Number((v ?? '').toString().replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  };

  // Helper: toma rangos del paciente si existen, sino los del parámetro clínico, y sino defaults
  const pickRanges = (pc?: ParametroClinicoOut, defNormMin = 0, defNormMax = 0, defCritMin?: number, defCritMax?: number) => {
    const rp = pc ? rangos[pc.id_parametro] : undefined;
    const normMin = rp?.min_normal ?? pc?.rango_ref_min ?? defNormMin;
    const normMax = rp?.max_normal ?? pc?.rango_ref_max ?? defNormMax;
    const critMin = rp?.min_critico ?? defCritMin ?? normMin;
    const critMax = rp?.max_critico ?? defCritMax ?? normMax;
    return { normMin: Number(normMin), normMax: Number(normMax), critMin: Number(critMin), critMax: Number(critMax) };
  };

  // severidad por umbrales normal/critico
  const severityByRanges = (value: number, r: { normMin: number; normMax: number; critMin: number; critMax: number }): Severidad => {
    if (Number.isNaN(value)) return 'normal';
    if (value < r.critMin || value > r.critMax) return 'critical';
    if (value < r.normMin || value > r.normMax) return 'warning';
    return 'normal';
  };

  // --- Validación requerida ---
  const validate = () => {
    const e: Record<string, string> = {};

    const bg = parseNumber(newMeasurement.bloodSugar);
    if (!newMeasurement.bloodSugar) e.bloodSugar = 'Requerido';
    else if (Number.isNaN(bg)) e.bloodSugar = 'Debe ser numérico';

    const sys = parseNumber(newMeasurement.bloodPressureSys);
    if (!newMeasurement.bloodPressureSys) e.bloodPressureSys = 'Requerido';
    else if (Number.isNaN(sys)) e.bloodPressureSys = 'Debe ser numérico';

    const dia = parseNumber(newMeasurement.bloodPressureDia);
    if (!newMeasurement.bloodPressureDia) e.bloodPressureDia = 'Requerido';
    else if (Number.isNaN(dia)) e.bloodPressureDia = 'Debe ser numérico';

    const ox = parseNumber(newMeasurement.oxygen);
    if (!newMeasurement.oxygen) e.oxygen = 'Requerido';
    else if (Number.isNaN(ox)) e.oxygen = 'Debe ser numérico';

    const t = parseNumber(newMeasurement.temperature);
    if (!newMeasurement.temperature) e.temperature = 'Requerido';
    else if (Number.isNaN(t)) e.temperature = 'Debe ser numérico';

    // asegurar que llegaron parámetros y rangos
    if (!P.GLUCOSA || !P.PRESION_SIS || !P.PRESION_DIA || !P.OXIGENO || !P.TEMP) {
      e._params = 'No están disponibles todos los parámetros clínicos. Intenta recargar.';
    }
    if (rutPaciente && Object.keys(rangos).length === 0) {
      // no es error fatal, pero te aviso si no hay ningún rango personalizado
      // e._rangos = 'No hay rangos personalizados para este paciente.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const allValid =
    !!rutPaciente &&
    !loadingParams &&
    !paramsError &&
    !loadingRangos && // opcional: si quieres permitir guardar aun si no hay rangos, quita esto
    newMeasurement.bloodSugar.trim() !== '' &&
    newMeasurement.bloodPressureSys.trim() !== '' &&
    newMeasurement.bloodPressureDia.trim() !== '' &&
    newMeasurement.oxygen.trim() !== '' &&
    newMeasurement.temperature.trim() !== '' &&
    !!P.GLUCOSA &&
    !!P.PRESION_SIS &&
    !!P.PRESION_DIA &&
    !!P.OXIGENO &&
    !!P.TEMP;

  const handleAddMeasurement = async () => {
    if (!rutPaciente) return;
    if (!validate()) return;

    const sys = parseNumber(newMeasurement.bloodPressureSys);
    const dia = parseNumber(newMeasurement.bloodPressureDia);
    const bg = parseNumber(newMeasurement.bloodSugar);
    const ox = parseNumber(newMeasurement.oxygen);
    const t  = parseNumber(newMeasurement.temperature);

    // RANGOS
    const rBG  = pickRanges(P.GLUCOSA, 70, 140, 60, 250);
    const rSYS = pickRanges(P.PRESION_SIS, 90, 140, 70, 200);
    const rDIA = pickRanges(P.PRESION_DIA, 60, 90,  50, 120);
    const rOX  = pickRanges(P.OXIGENO, 95, 100, 85, 100);
    const rT   = pickRanges(P.TEMP, 36, 37.7, 35, 41);

    // Severidades
    const sevSys = severityByRanges(sys, rSYS);
    const sevDia = severityByRanges(dia, rDIA);
    const sevBG  = severityByRanges(bg,  rBG);
    const sevOX  = severityByRanges(ox,  rOX);
    const sevT   = severityByRanges(t,   rT);

    const worst = (...s: Severidad[]) =>
      s.includes('critical') ? 'critical' : s.includes('warning') ? 'warning' : 'normal';

    const bpSeverity: Severidad = worst(sevSys, sevDia);
    const nowIso = new Date().toISOString();

    const baseMedicion: MedicionCreatePayload = {
      rut_paciente: String(rutPaciente),
      fecha_registro: nowIso,
      origen: 'WEB',
      registrado_por: 'SELF',
      observacion: newMeasurement.notes || '',
      evaluada_en: nowIso,
      tiene_alerta: [bpSeverity, sevBG, sevOX, sevT].some((s) => s !== 'normal'),
      severidad_max: worst(bpSeverity, sevBG, sevOX, sevT),
      resumen_alerta:
        worst(bpSeverity, sevBG, sevOX, sevT) === 'critical'
          ? 'Algún valor crítico'
          : worst(bpSeverity, sevBG, sevOX, sevT) === 'warning'
          ? 'Algún valor fuera de rango'
          : 'Sin alerta',
    };

    const detalles: Array<{
      id_parametro: number;
      id_unidad: number;
      valor_num: number;
      valor_texto: string;
      fuera_rango: boolean;
      severidad: Severidad | string;
      umbral_min: number;
      umbral_max: number;
      tipo_alerta: string;
    }> = [];

    // Glucosa
    detalles.push({
      id_parametro: P.GLUCOSA!.id_parametro,
      id_unidad: P.GLUCOSA!.id_unidad,
      valor_num: bg,
      valor_texto: `${bg} mg/dL`,
      fuera_rango: sevBG !== 'normal',
      severidad: sevBG,
      umbral_min: rBG.normMin,
      umbral_max: rBG.normMax,
      tipo_alerta: sevBG === 'critical' ? 'GLU_CRIT' : sevBG === 'warning' ? 'GLU_WARN' : 'NONE',
    });

    // Presión SISTÓLICA
    detalles.push({
      id_parametro: P.PRESION_SIS!.id_parametro,
      id_unidad: P.PRESION_SIS!.id_unidad,
      valor_num: sys,
      valor_texto: `${sys} mmHg`,
      fuera_rango: sevSys !== 'normal',
      severidad: sevSys,
      umbral_min: rSYS.normMin,
      umbral_max: rSYS.normMax,
      tipo_alerta: sevSys === 'critical' ? 'SYS_CRIT' : sevSys === 'warning' ? 'SYS_WARN' : 'NONE',
    });

    // Presión DIASTÓLICA
    detalles.push({
      id_parametro: P.PRESION_DIA!.id_parametro,
      id_unidad: P.PRESION_DIA!.id_unidad,
      valor_num: dia,
      valor_texto: `${dia} mmHg`,
      fuera_rango: sevDia !== 'normal',
      severidad: sevDia,
      umbral_min: rDIA.normMin,
      umbral_max: rDIA.normMax,
      tipo_alerta: sevDia === 'critical' ? 'DIA_CRIT' : sevDia === 'warning' ? 'DIA_WARN' : 'NONE',
    });

    // Oxígeno
    detalles.push({
      id_parametro: P.OXIGENO!.id_parametro,
      id_unidad: P.OXIGENO!.id_unidad,
      valor_num: ox,
      valor_texto: `${ox}%`,
      fuera_rango: sevOX !== 'normal',
      severidad: sevOX,
      umbral_min: rOX.normMin,
      umbral_max: rOX.normMax,
      tipo_alerta: sevOX === 'critical' ? 'O2_CRIT' : sevOX === 'warning' ? 'O2_WARN' : 'NONE',
    });

    // Temperatura (nota: ya NO escalamos *10; guardamos el valor real)
    detalles.push({
      id_parametro: P.TEMP!.id_parametro,
      id_unidad: P.TEMP!.id_unidad,
      valor_num: t,
      valor_texto: `${t} °C`,
      fuera_rango: sevT !== 'normal',
      severidad: sevT,
      umbral_min: rT.normMin,
      umbral_max: rT.normMax,
      tipo_alerta: sevT === 'critical' ? 'TEMP_CRIT' : sevT === 'warning' ? 'TEMP_WARN' : 'NONE',
    });

    try {
      setSubmitting(true);
      await createMedicionWithDetails({ medicion: baseMedicion, detalles });
      setNewMeasurement({
        bloodSugar: '',
        bloodPressureSys: '',
        bloodPressureDia: '',
        oxygen: '',
        temperature: '',
        notes: '',
      });
      setErrors({});
      alert('Medición registrada correctamente.');
    } catch (e: any) {
      alert(e?.message ?? 'No se pudo registrar la medición.');
    } finally {
      setSubmitting(false);
    }
  };

  const helper = (name: keyof typeof errors) =>
    errors[name] ? <p className="text-xs text-red-600 mt-1">{errors[name]}</p> : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Measurement */}
        <Card>
          <CardHeader>
            <CardTitle>Registre las mediciones de hoy</CardTitle>
            <CardDescription>
              {loadingParams || loadingRangos ? 'Cargando configuración…' : 'Ingresa tus medidas de salud de hoy'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(paramsError || rangosError) && (
              <p className="text-sm text-red-600">{paramsError ?? rangosError}</p>
            )}
            {errors._params && <p className="text-sm text-red-600">{errors._params}</p>}

            <div className="grid grid-cols-2 gap-4">
              {/* Glucosa */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {(P.GLUCOSA?.descipcion ?? 'Glucemia')} ({P.GLUCOSA ? 'mg/dL' : '—'})
                </label>
                <Input
                  required
                  type="number"
                  placeholder="120"
                  disabled={!P.GLUCOSA}
                  value={newMeasurement.bloodSugar}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, bloodSugar: e.target.value })}
                />
                {helper('bloodSugar')}
              </div>

              {/* Presión SISTÓLICA */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {(P.PRESION_SIS?.descipcion ?? 'Presión sistólica')} ({P.PRESION_SIS ? 'mmHg' : '—'})
                </label>
                <Input
                  required
                  type="number"
                  placeholder="120"
                  disabled={!P.PRESION_SIS}
                  value={newMeasurement.bloodPressureSys}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, bloodPressureSys: e.target.value })}
                />
                {helper('bloodPressureSys')}
              </div>

              {/* Presión DIASTÓLICA */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {(P.PRESION_DIA?.descipcion ?? 'Presión diastólica')} ({P.PRESION_DIA ? 'mmHg' : '—'})
                </label>
                <Input
                  required
                  type="number"
                  placeholder="80"
                  disabled={!P.PRESION_DIA}
                  value={newMeasurement.bloodPressureDia}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, bloodPressureDia: e.target.value })}
                />
                {helper('bloodPressureDia')}
              </div>

              {/* Oxígeno */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {(P.OXIGENO?.descipcion ?? 'Oxígeno')} ({P.OXIGENO ? '%' : '—'})
                </label>
                <Input
                  required
                  type="number"
                  placeholder="98"
                  disabled={!P.OXIGENO}
                  value={newMeasurement.oxygen}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, oxygen: e.target.value })}
                />
                {helper('oxygen')}
              </div>

              {/* Temperatura */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {(P.TEMP?.descipcion ?? 'Temperatura')} ({P.TEMP ? '°C' : '—'})
                </label>
                <Input
                  required
                  type="number"
                  placeholder="36.8"
                  step="0.1"
                  disabled={!P.TEMP}
                  value={newMeasurement.temperature}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, temperature: e.target.value })}
                />
                {helper('temperature')}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notas (opcional)</label>
              <Input
                placeholder="Notas opcionales..."
                value={newMeasurement.notes}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
              />
            </div>

            {!rutPaciente && (
              <p className="text-sm text-amber-600">
                No se encontró el rut del paciente (rutPaciente). Asegúrate de pasarlo desde el Login.
              </p>
            )}

            <Button
              onClick={handleAddMeasurement}
              className="w-full"
              disabled={submitting || !allValid}
              title={
                !rutPaciente
                  ? 'Falta rutPaciente'
                  : loadingParams || loadingRangos
                  ? 'Cargando configuración'
                  : !allValid
                  ? 'Completa todos los campos'
                  : undefined
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              {submitting ? 'Saving…' : 'Guardar medición'}
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Metas semanales</CardTitle>
            <CardDescription>Realice un seguimiento de su progreso hacia sus objetivos de salud semanales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingGamificacion || loadingWeeklyProgress ? (
              <p className="text-sm text-muted-foreground">Cargando datos de progreso...</p>
            ) : gamificacionError ? (
              <p className="text-sm text-red-600">Error: {gamificacionError}</p>
            ) : (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Medidas de esta semana</span>
                    <span className="text-sm text-muted-foreground">
                      {weeklyProgress.weeklyProgress}/{weeklyProgress.weeklyGoal}
                    </span>
                  </div>
                  <Progress value={(weeklyProgress.weeklyProgress / weeklyProgress.weeklyGoal) * 100} className="h-2" />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">¡Gran progreso!</h4>
                  <p className="text-sm text-green-700">
                    Has iniciado sesión {weeklyProgress.weeklyProgress} de {weeklyProgress.weeklyGoal} Medidas esta semana. ¡Sigue así para mantener la racha!
                  </p>
                </div>

                {/* Información adicional de gamificación */}
                {gamificacion && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{gamificacion.puntos}</div>
                      <p className="text-xs text-blue-700">Puntos totales</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{gamificacion.racha_dias}</div>
                      <p className="text-xs text-purple-700">Días de racha</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Measurements Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias recientes</CardTitle>
          <CardDescription>Su historial de mediciones durante los últimos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingChart ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Cargando gráfica de tendencias...
            </div>
          ) : recentMeasurements.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos de mediciones recientes para mostrar
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
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
                {recentMeasurements.some(d => d.bloodPressure != null) && (
                  <Line 
                    type="monotone" 
                    dataKey="bloodPressure" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    name="Presión Arterial" 
                    connectNulls={false}
                  />
                )}
                {recentMeasurements.some(d => d.temperature != null) && (
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#ef4444" 
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
    </div>
  );
}

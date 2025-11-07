import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Loader2, Search, Calendar, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';

import { createMedicionWithDetails } from '../../services/paciente';
import type { MedicionCreatePayload, Severidad } from '../../services/paciente';
import { procesarGamificacionMedicion } from '../../services/gamificacion';
import { listParametrosClinicos, type ParametroClinicoOut } from '../../services/parametroClinico';
import { getRangosIndexByParametro, type RangoPacienteOut } from '../../services/rangoPaciente';
import { listarMediciones, type MedicionOut } from '../../services/medicion';
import { usePacienteCuidador } from '../../hooks/usePacienteCuidador';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export default function CuidadorDataEntry() {
  // Hook para obtener pacientes asignados
  const { pacientes, loading: loadingPacientes, error: errorPacientes } = usePacienteCuidador();

  // Estados para filtros y búsqueda de mediciones
  const [filtros, setFiltros] = useState({
    rut_paciente: '',
    fecha_inicio: (() => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - 7); // 7 días hacia atrás
      return fecha.toISOString().split('T')[0];
    })(),
    fecha_fin: new Date().toISOString().split('T')[0], // Hoy
  });

  const [mediciones, setMediciones] = useState<MedicionOut[]>([]);
  const [loadingMediciones, setLoadingMediciones] = useState(false);
  const [errorMediciones, setErrorMediciones] = useState<string | null>(null);
  const [totalMediciones, setTotalMediciones] = useState(0);

  // Estado para el modal de agregar medición
  const [modalAbierto, setModalAbierto] = useState(false);

  const [selectedPatientRut, setSelectedPatientRut] = useState<string>('');
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

  // Función para buscar mediciones
  const buscarMediciones = async () => {
    if (!filtros.rut_paciente) {
      setErrorMediciones('Debe seleccionar un paciente');
      return;
    }

    try {
      setLoadingMediciones(true);
      setErrorMediciones(null);

      const desde = filtros.fecha_inicio ? new Date(filtros.fecha_inicio + 'T00:00:00Z') : undefined;
      const hasta = filtros.fecha_fin ? new Date(filtros.fecha_fin + 'T23:59:59Z') : undefined;

      const result = await listarMediciones(1, 50, undefined);
      
      if (result.ok) {
        // Filtrar por paciente y fechas en el frontend ya que el servicio no tiene estos parámetros
        let medicionesFiltradas = result.data.items.filter(m => m.rut_paciente === filtros.rut_paciente);
        
        if (desde) {
          medicionesFiltradas = medicionesFiltradas.filter(m => 
            new Date(m.fecha_registro) >= desde
          );
        }
        
        if (hasta) {
          medicionesFiltradas = medicionesFiltradas.filter(m => 
            new Date(m.fecha_registro) <= hasta
          );
        }

        setMediciones(medicionesFiltradas);
        setTotalMediciones(medicionesFiltradas.length);
      } else {
        setErrorMediciones(result.message);
      }
    } catch (error: any) {
      console.error('Error al buscar mediciones:', error);
      setErrorMediciones('Error al cargar las mediciones');
    } finally {
      setLoadingMediciones(false);
    }
  };

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

  // Carga rangos por paciente cuando se selecciona un paciente
  useEffect(() => {
    (async () => {
      if (!selectedPatientRut) {
        setRangos({});
        return;
      }
      try {
        setLoadingRangos(true);
        setRangosError(null);
        const idx = await getRangosIndexByParametro(selectedPatientRut);
        setRangos(idx);
      } catch (e: any) {
        setRangosError(e?.message ?? 'No se pudieron cargar los rangos del paciente');
      } finally {
        setLoadingRangos(false);
      }
    })();
  }, [selectedPatientRut]);

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

    if (!selectedPatientRut) e.patient = 'Debe seleccionar un paciente';

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

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddMeasurement = async () => {
    if (!selectedPatientRut) return;
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

    // Obtener RUT del cuidador desde localStorage
    const authDataString = localStorage.getItem("auth");
    const authData = authDataString ? JSON.parse(authDataString) : null;
    const rutCuidador = authData?.user?.id || 'CUIDADOR';

    const baseMedicion: MedicionCreatePayload = {
      rut_paciente: selectedPatientRut,
      fecha_registro: nowIso,
      origen: 'WEB_CUIDADOR',
      registrado_por: rutCuidador,
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

    // Temperatura
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
      
      // 1. Crear la medición
      await createMedicionWithDetails({ medicion: baseMedicion, detalles });
      
      // 2. Procesar gamificación (20 puntos por medición diaria)
      try {
        const resultadoGamificacion = await procesarGamificacionMedicion(selectedPatientRut);
        if (resultadoGamificacion.success && resultadoGamificacion.puntosGanados && resultadoGamificacion.puntosGanados > 0) {
          console.log(`🎮 Gamificación: +${resultadoGamificacion.puntosGanados} puntos, racha ${resultadoGamificacion.nuevaRacha} días`);
          alert(`Medición registrada correctamente.\n🎮 ¡El paciente ganó ${resultadoGamificacion.puntosGanados} puntos! Racha: ${resultadoGamificacion.nuevaRacha} días.`);
        } else {
          alert('Medición registrada correctamente para el paciente.');
        }
      } catch (gamificationError) {
        console.warn('Error en gamificación, pero medición guardada:', gamificationError);
        alert('Medición registrada correctamente para el paciente.');
      }
      
      // 3. Limpiar formulario
      setNewMeasurement({
        bloodSugar: '',
        bloodPressureSys: '',
        bloodPressureDia: '',
        oxygen: '',
        temperature: '',
        notes: '',
      });
      setErrors({});
      
    } catch (e: any) {
      alert(e?.message ?? 'No se pudo registrar la medición.');
    } finally {
      setSubmitting(false);
    }
  };

  const helper = (name: keyof typeof errors) =>
    errors[name] ? <p className="text-xs text-red-600 mt-1">{errors[name]}</p> : null;

  // Función para formatear fecha
  const formatearFecha = (fechaStr: string) => {
    return new Date(fechaStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener el icono y color de estado de alerta
  const getEstadoAlertaInfo = (estado: string, tieneAlerta: boolean) => {
    if (!tieneAlerta) return { icon: CheckCircle, color: 'text-green-600', text: 'Sin alerta' };
    
    switch (estado) {
      case 'nueva':
        return { icon: AlertTriangle, color: 'text-red-600', text: 'Nueva' };
      case 'en_proceso':
        return { icon: Clock, color: 'text-yellow-600', text: 'En proceso' };
      case 'resuelta':
        return { icon: CheckCircle, color: 'text-green-600', text: 'Resuelta' };
      case 'ignorada':
        return { icon: CheckCircle, color: 'text-gray-600', text: 'Ignorada' };
      default:
        return { icon: AlertTriangle, color: 'text-red-600', text: estado };
    }
  };

  return (
    <div className="space-y-6">
      {/* Sección de filtros y búsqueda de mediciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Consultar Mediciones Registradas
          </CardTitle>
          <CardDescription>
            Busca y revisa las mediciones registradas para tus pacientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <User className="h-3 w-3" />
                Paciente *
              </label>
              {loadingPacientes ? (
                <div className="flex items-center gap-2 p-2 border rounded h-10 bg-background">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando...</span>
                </div>
              ) : (
                <Select
                  value={filtros.rut_paciente}
                  onValueChange={(value: string) => setFiltros({ ...filtros, rut_paciente: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.rut_paciente} value={paciente.rut_paciente}>
                        RUT: {paciente.rut_paciente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex-none w-40 space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha Inicio
              </label>
              <Input
                type="date"
                className="h-10"
                value={filtros.fecha_inicio}
                onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
              />
            </div>

            <div className="flex-none w-40 space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha Fin
              </label>
              <Input
                type="date"
                className="h-10"
                value={filtros.fecha_fin}
                onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
              />
            </div>

            <div className="flex-none space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button 
                onClick={buscarMediciones}
                disabled={loadingMediciones || !filtros.rut_paciente}
                className="h-10 px-4"
              >
                {loadingMediciones ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>

            <div className="flex-none space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="h-10 px-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar medición
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Nueva Medición</DialogTitle>
                    <DialogDescription>
                      Completa los datos para registrar una nueva medición del paciente
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Formulario de medición */}
                  <div className="space-y-4">
                    {(paramsError || rangosError || errorPacientes) && (
                      <p className="text-sm text-red-600">{paramsError ?? rangosError ?? errorPacientes}</p>
                    )}
                    {errors._params && <p className="text-sm text-red-600">{errors._params}</p>}

                    {/* Selector de paciente */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Seleccionar paciente *</label>
                      {loadingPacientes ? (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Cargando pacientes...</span>
                        </div>
                      ) : (
                        <Select
                          value={selectedPatientRut}
                          onValueChange={setSelectedPatientRut}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Elige un paciente" />
                          </SelectTrigger>
                          <SelectContent>
                            {pacientes.map((paciente) => (
                              <SelectItem key={paciente.rut_paciente} value={paciente.rut_paciente}>
                                RUT: {paciente.rut_paciente}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {helper('patient')}
                    </div>

                    {/* Formulario de mediciones */}
                    {selectedPatientRut && !loadingParams && !loadingRangos && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Mediciones disponibles:</h3>
                        
                        {/* Glucosa */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Glucosa (mg/dL)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Ej: 95"
                            value={newMeasurement.bloodSugar}
                            onChange={(e) => setNewMeasurement(prev => ({
                              ...prev,
                              bloodSugar: e.target.value
                            }))}
                          />
                          {helper('bloodSugar')}
                        </div>

                        {/* Presión arterial sistólica */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Presión arterial sistólica (mmHg)
                          </label>
                          <Input
                            type="number"
                            step="1"
                            placeholder="Ej: 120"
                            value={newMeasurement.bloodPressureSys}
                            onChange={(e) => setNewMeasurement(prev => ({
                              ...prev,
                              bloodPressureSys: e.target.value
                            }))}
                          />
                          {helper('bloodPressureSys')}
                        </div>

                        {/* Presión arterial diastólica */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Presión arterial diastólica (mmHg)
                          </label>
                          <Input
                            type="number"
                            step="1"
                            placeholder="Ej: 80"
                            value={newMeasurement.bloodPressureDia}
                            onChange={(e) => setNewMeasurement(prev => ({
                              ...prev,
                              bloodPressureDia: e.target.value
                            }))}
                          />
                          {helper('bloodPressureDia')}
                        </div>

                        {/* Oxígeno */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Saturación de oxígeno (%)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Ej: 98"
                            value={newMeasurement.oxygen}
                            onChange={(e) => setNewMeasurement(prev => ({
                              ...prev,
                              oxygen: e.target.value
                            }))}
                          />
                          {helper('oxygen')}
                        </div>

                        {/* Temperatura */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Temperatura corporal (°C)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Ej: 36.5"
                            value={newMeasurement.temperature}
                            onChange={(e) => setNewMeasurement(prev => ({
                              ...prev,
                              temperature: e.target.value
                            }))}
                          />
                          {helper('temperature')}
                        </div>

                        {/* Notas adicionales */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notas adicionales (opcional)</label>
                          <Input
                            placeholder="Ej: Paciente se siente bien"
                            value={newMeasurement.notes}
                            onChange={(e) => setNewMeasurement(prev => ({
                              ...prev,
                              notes: e.target.value
                            }))}
                          />
                        </div>
                      </div>
                    )}

                    {/* Botón de envío */}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setModalAbierto(false)}
                        type="button"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={async () => {
                          await handleAddMeasurement();
                          setModalAbierto(false);
                        }}
                        disabled={
                          submitting ||
                          !selectedPatientRut ||
                          loadingParams ||
                          loadingRangos ||
                          Object.values(newMeasurement).slice(0, 5).every(v => !v)
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {submitting ? 'Guardando…' : 'Registrar medición'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Error de búsqueda */}
          {errorMediciones && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{errorMediciones}</p>
            </div>
          )}

          {/* Tabla de resultados */}
          {mediciones.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-700">
                  {totalMediciones} medición{totalMediciones !== 1 ? 'es' : ''} encontrada{totalMediciones !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Origen
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severidad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resumen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mediciones.map((medicion) => {
                      const estadoInfo = getEstadoAlertaInfo(medicion.estado_alerta, medicion.tiene_alerta);
                      const IconoEstado = estadoInfo.icon;
                      
                      return (
                        <tr key={medicion.id_medicion} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatearFecha(medicion.fecha_registro)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {medicion.origen}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <IconoEstado className={`h-4 w-4 ${estadoInfo.color}`} />
                              <span className={`text-sm ${estadoInfo.color}`}>
                                {estadoInfo.text}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              medicion.severidad_max === 'critical' 
                                ? 'bg-red-100 text-red-800'
                                : medicion.severidad_max === 'warning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {medicion.severidad_max === 'critical' ? 'Crítica' : 
                               medicion.severidad_max === 'warning' ? 'Advertencia' : 'Normal'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {medicion.resumen_alerta}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {mediciones.length === 0 && !loadingMediciones && !errorMediciones && filtros.rut_paciente && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No se encontraron mediciones para los filtros seleccionados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
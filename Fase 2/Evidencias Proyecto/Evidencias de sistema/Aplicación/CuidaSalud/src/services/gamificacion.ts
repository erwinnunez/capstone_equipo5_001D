// src/services/gamificacion.ts

const API_HOST = import.meta.env.VITE_API_HOST ?? "http://127.0.0.1:8000";

const RUTA_GAMIFICACION = `${API_HOST}/gamificacion-perfil`;

// Import para obtener TODAS las mediciones, no solo alertas
import { listarMediciones } from './medicion';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "error en la solicitud";
    try {
      const err = await response.json();
      message = typeof err === "string" ? err : err?.detail ?? message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

/* =========================================================
   TIPOS
   ========================================================= */

export interface GamificacionPerfilCreate {
  rut_paciente: string;
  puntos: number;
  racha_dias: number;
  ultima_actividad: string; // DateTime as ISO string
}

export interface GamificacionPerfilOut {
  rut_paciente: string;
  puntos: number;
  racha_dias: number;
  ultima_actividad: string; // DateTime as ISO string
}

// Tipos para mediciones (simplificados)
export interface MedicionOut {
  id_medicion: number;
  rut_paciente: string;
  fecha_registro: string;
  origen: string;
  registrado_por: string;
  observacion: string;
  evaluada_en: string;
  tiene_alerta: boolean;
  severidad_max: string;
  resumen_alerta: string;
  estado_alerta: string;
  tomada_por: number | null;
  tomada_en: string | null;
  resuelta_en: string | null;
  ignorada_en: string | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

/* =========================================================
   FUNCIONES
   ========================================================= */

/**
 * Crea un nuevo perfil de gamificación para un paciente de forma segura
 * No lanza errores, solo reporta el resultado
 */
export async function createGamificacionPerfilSafe(payload: GamificacionPerfilCreate): Promise<{ success: boolean; error?: string }> {
  try {
    await createGamificacionPerfil(payload);
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Error desconocido al crear perfil de gamificación'
    };
  }
}

/**
 * Crea un nuevo perfil de gamificación para un paciente
 */
export async function createGamificacionPerfil(payload: GamificacionPerfilCreate): Promise<GamificacionPerfilOut> {
  try {
    const response = await fetch(RUTA_GAMIFICACION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Error del servidor'}`);
    }
    
    return await response.json();
  } catch (error: any) {
    // Mejorar el mensaje de error para debugging
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Error de conexión con el servicio de gamificación: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Obtiene el perfil de gamificación de un paciente específico
 */
export async function getGamificacionPerfil(rutPaciente: string): Promise<GamificacionPerfilOut> {
  const response = await fetch(`${RUTA_GAMIFICACION}/${rutPaciente}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<GamificacionPerfilOut>(response);
}

/**
 * Calcula el progreso semanal de mediciones de un paciente
 * @param rutPaciente RUT del paciente
 * @returns { weeklyProgress: number, weeklyGoal: number }
 */
export async function getWeeklyMeasurementProgress(rutPaciente: string): Promise<{ weeklyProgress: number; weeklyGoal: number }> {
  try {
    // Calcular fechas de la semana actual (lunes a domingo)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si es domingo, ir al lunes anterior
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Obtener TODAS las mediciones de la semana actual
    const result = await listarMediciones(1, 200);
    
    if (!result.ok) {
      console.warn("Error obteniendo mediciones semanales:", result.message);
      return { weeklyProgress: 0, weeklyGoal: 7 };
    }

    // Filtrar por paciente y rango de fechas
    const medicionesFiltradas = result.data.items.filter(medicion => 
      medicion.rut_paciente === rutPaciente &&
      new Date(medicion.fecha_registro) >= monday &&
      new Date(medicion.fecha_registro) <= sunday
    );
    
    // Contar mediciones únicas por día (evitar duplicados del mismo día)
    const measurementDays = new Set<string>();
    medicionesFiltradas.forEach(medicion => {
      const date = new Date(medicion.fecha_registro);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      measurementDays.add(dayKey);
    });

    const weeklyProgress = measurementDays.size;
    const weeklyGoal = 7; // Meta: 1 medición por día de la semana

    return { weeklyProgress, weeklyGoal };
    
  } catch (error) {
    console.warn("Error calculating weekly progress:", error);
    // En caso de error, devolver valores por defecto
    return { weeklyProgress: 0, weeklyGoal: 7 };
  }
}

/**
 * Obtiene mediciones recientes de un paciente para mostrar en gráficas
 * @param rutPaciente RUT del paciente
 * @param days Número de días hacia atrás (por defecto 7)
 * @returns Array de mediciones con valores organizados por fecha
 */
export async function getRecentMeasurementsForChart(
  rutPaciente: string, 
  days: number = 7
): Promise<Array<{
  date: string;
  bloodSugar?: number;
  bloodPressure?: number;
  oxygen?: number;
  temperature?: number;
  [key: string]: any;
}>> {
  try {
    // Calcular fechas
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    // Obtener TODAS las mediciones (no solo las de alerta)
    const result = await listarMediciones(1, 200); // Obtener más registros para filtrar por fecha
    
    if (!result.ok) {
      console.warn("Error obteniendo mediciones:", result.message);
      return [];
    }

    // Filtrar por paciente y rango de fechas
    const medicionesFiltradas = result.data.items.filter(medicion => 
      medicion.rut_paciente === rutPaciente &&
      new Date(medicion.fecha_registro) >= startDate &&
      new Date(medicion.fecha_registro) <= endDate
    );
    
    // Obtener detalles de cada medición
    const measurementsWithDetails = await Promise.all(
      medicionesFiltradas.map(async (medicion: MedicionOut) => {
        try {
          const detallesResponse = await fetch(`${API_HOST}/medicion-detalle?` + new URLSearchParams({
            id_medicion: String(medicion.id_medicion),
            page_size: "20"
          }), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          const detallesResult = await handleResponse<Page<any>>(detallesResponse);
          return {
            ...medicion,
            detalles: detallesResult.items || []
          };
        } catch {
          return {
            ...medicion,
            detalles: []
          };
        }
      })
    );

    // Crear un array de mediciones individuales en lugar de agrupar por fecha
    const chartDataItems: Array<{
      date: string;
      timestamp: string; // Para distinguir múltiples mediciones del mismo día
      bloodSugar?: number;
      bloodPressure?: number;
      oxygen?: number;
      temperature?: number;
      [key: string]: any;
    }> = [];
    
    measurementsWithDetails.forEach((medicion: any) => {
      const dateKey = new Date(medicion.fecha_registro).toISOString().split('T')[0]; // YYYY-MM-DD
      const timestamp = medicion.fecha_registro; // Timestamp completo para ordenar
      
      const medicionData: any = {
        date: dateKey,
        timestamp: timestamp,
        id_medicion: medicion.id_medicion, // Para debugging
      };

      // Mapear parámetros clínicos a campos de la gráfica
      medicion.detalles.forEach((detalle: any) => {
        if (detalle.valor_num != null) {
          switch (detalle.id_parametro) {
            case 1: // Glucosa
              medicionData.bloodSugar = detalle.valor_num;
              break;
            case 2: // Presión sistólica
              medicionData.bloodPressure = detalle.valor_num;
              break;
            case 5: // Presión diastólica
              medicionData.bloodPressureDia = detalle.valor_num;
              break;
            case 3: // Oxígeno
              medicionData.oxygen = detalle.valor_num;
              break;
            case 4: // Temperatura
              medicionData.temperature = detalle.valor_num;
              break;
            default:
              medicionData[`param_${detalle.id_parametro}`] = detalle.valor_num;
          }
        }
      });

      // Solo agregar si tiene al menos un valor
      const hasValues = Object.keys(medicionData).some(key => 
        key !== 'date' && key !== 'timestamp' && key !== 'id_medicion' && medicionData[key] != null
      );
      
      if (hasValues) {
        chartDataItems.push(medicionData);
      }
    });

    // Ordenar por timestamp completo (más recientes al final para la gráfica)
    const chartData = chartDataItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Debug: Log para verificar qué datos se están obteniendo
    console.log(`📊 [getRecentMeasurementsForChart] Obtenidas ${chartData.length} mediciones para paciente ${rutPaciente}:`, chartData);

    return chartData;
    
  } catch (error) {
    console.warn("Error loading recent measurements for chart:", error);
    // En caso de error, devolver array vacío
    return [];
  }
}

/* =========================================================
   OBTENER PERFIL DE GAMIFICACIÓN
   ========================================================= */

export async function getGamificacionPerfilDetallado(rutPaciente: string): Promise<GamificacionPerfilOut | null> {
  try {
    console.log(`🎮 [getGamificacionPerfilDetallado] Obteniendo perfil para paciente ${rutPaciente}`);

    const response = await fetch(`${RUTA_GAMIFICACION}/${rutPaciente}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`⚠️ [getGamificacionPerfilDetallado] Perfil no encontrado para paciente ${rutPaciente}`);
        return null;
      }
      
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      throw new Error(errorMessage);
    }

    const perfil = await response.json() as GamificacionPerfilOut;
    console.log(`✅ [getGamificacionPerfilDetallado] Perfil obtenido para paciente ${rutPaciente}:`, perfil);
    return perfil;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [getGamificacionPerfilDetallado] Error para paciente ${rutPaciente}:`, errorMessage);
    throw error;
  }
}

export interface GamificacionPerfilUpdate {
  ultima_actividad?: string;
  puntos?: number;
  racha_dias?: number;
}

export async function updateUltimaActividad(rutPaciente: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Crear fecha en formato local sin zona horaria (offset-naive)
    const now = new Date();
    const localISOString = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
    
    const payload: GamificacionPerfilUpdate = {
      ultima_actividad: localISOString
    };

    console.log(`🎮 [updateUltimaActividad] Intentando actualizar última actividad para paciente ${rutPaciente} con fecha: ${localISOString}`);

    const response = await fetch(`${RUTA_GAMIFICACION}/${rutPaciente}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      console.warn(`❌ [updateUltimaActividad] Error ${response.status} para paciente ${rutPaciente}:`, errorMessage);
      return { success: false, error: errorMessage };
    }

    await response.json(); // Consumir la respuesta
    console.log(`✅ [updateUltimaActividad] Última actividad actualizada exitosamente para paciente ${rutPaciente}`);
    
    // Evaluar insignias después de actualizar actividad
    try {
      const { evaluarYOtorgarInsignias } = await import('./insignia');
      const insigniasResult = await evaluarYOtorgarInsignias(rutPaciente);
      
      if (insigniasResult.success && insigniasResult.insigniasOtorgadas.length > 0) {
        console.log(`🏆 [updateUltimaActividad] ${insigniasResult.insigniasOtorgadas.length} nuevas insignias otorgadas a ${rutPaciente}`);
      }
    } catch (insigniasError) {
      console.warn(`⚠️ [updateUltimaActividad] Error en evaluación de insignias para ${rutPaciente}:`, insigniasError);
    }
    
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [updateUltimaActividad] Error de conexión para paciente ${rutPaciente}:`, errorMessage);
    return { success: false, error: `Error de conexión: ${errorMessage}` };
  }
}

/* =========================================================
   GAMIFICACIÓN POR MEDICIÓN DIARIA
   ========================================================= */

export async function procesarGamificacionMedicion(rutPaciente: string): Promise<{ success: boolean; error?: string; puntosGanados?: number; nuevaRacha?: number }> {
  try {
    console.log(`🎮 [procesarGamificacionMedicion] Procesando gamificación para medición del paciente ${rutPaciente}`);
    
    // 1. Verificar si ya hizo una medición hoy consultando las mediciones del día
    const hoy = new Date().toISOString().split('T')[0]; // Solo fecha YYYY-MM-DD
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const fechaMañana = mañana.toISOString().split('T')[0];
    
    // Verificar si ya existe una medición hoy usando el mismo método que CuidadorDataEntry
    const { listarMediciones } = await import('../services/medicion');
    
    try {
      console.log(`🔍 [procesarGamificacionMedicion] Consultando mediciones del día para ${rutPaciente}`);
      
      const result = await listarMediciones(1, 100, undefined);
      
      if (result.ok) {
        // Filtrar por paciente y fecha de hoy (mismo método que CuidadorDataEntry)
        const inicioDelDia = new Date(`${hoy}T00:00:00Z`);
        const finDelDia = new Date(`${fechaMañana}T00:00:00Z`);
        
        const medicionesDeHoy = result.data.items.filter(m => {
          const fechaMedicion = new Date(m.fecha_registro);
          return m.rut_paciente === rutPaciente && 
                 fechaMedicion >= inicioDelDia && 
                 fechaMedicion < finDelDia;
        });
        
        console.log(`📊 [procesarGamificacionMedicion] Encontradas ${medicionesDeHoy.length} mediciones hoy para ${rutPaciente}`);
        
        // Si ya hay 2 o más mediciones hoy (incluyendo la recién creada), no dar puntos
        if (medicionesDeHoy.length >= 2) {
          console.log(`ℹ️ [procesarGamificacionMedicion] Paciente ${rutPaciente} ya tenía ${medicionesDeHoy.length - 1} medición(es) hoy, no se otorgan puntos adicionales`);
          
          // Obtener perfil actual para devolver la racha
          let perfilActual: GamificacionPerfilOut | null = null;
          try {
            perfilActual = await getGamificacionPerfilDetallado(rutPaciente);
          } catch (error) {
            console.warn(`⚠️ [procesarGamificacionMedicion] Error obteniendo perfil para devolver racha actual`);
          }
          
          return { 
            success: true, 
            puntosGanados: 0, 
            nuevaRacha: perfilActual?.racha_dias || 0
          };
        } else {
          console.log(`✅ [procesarGamificacionMedicion] Primera medición del día para ${rutPaciente} (${medicionesDeHoy.length} total)`);
        }
      } else {
        console.warn(`⚠️ [procesarGamificacionMedicion] Error consultando mediciones: ${result.message}`);
      }
    } catch (error) {
      console.warn(`⚠️ [procesarGamificacionMedicion] Error consultando mediciones del día, continuando con gamificación:`, error);
    }
    
    // 2. Obtener perfil actual de gamificación
    let perfilActual: GamificacionPerfilOut | null;
    try {
      perfilActual = await getGamificacionPerfilDetallado(rutPaciente);
    } catch (error) {
      console.warn(`⚠️ [procesarGamificacionMedicion] Error obteniendo perfil para ${rutPaciente}, creando uno nuevo`);
      perfilActual = null;
    }

    const ahora = new Date();
    let nuevoPuntos = 20; // Puntos base por medición
    let nuevaRacha = 1;   // Racha por defecto
    
    if (perfilActual) {
      // 3. Calcular nueva racha basada en la última actividad
      const ultimaActividad = new Date(perfilActual.ultima_actividad);
      const diferenciaDias = Math.floor((ahora.getTime() - ultimaActividad.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diferenciaDias > 2) {
        // Si han pasado más de 2 días, reiniciar racha
        nuevaRacha = 1;
        console.log(`🔄 [procesarGamificacionMedicion] Racha reiniciada para ${rutPaciente} (${diferenciaDias} días sin actividad)`);
      } else if (diferenciaDias >= 1) {
        // Si es un día diferente (pero no más de 2), incrementar racha
        nuevaRacha = perfilActual.racha_dias + 1;
        console.log(`📈 [procesarGamificacionMedicion] Racha incrementada para ${rutPaciente}: ${perfilActual.racha_dias} → ${nuevaRacha}`);
      } else {
        // Mismo día, mantener racha actual (primera medición del día)
        nuevaRacha = Math.max(1, perfilActual.racha_dias);
        console.log(`📊 [procesarGamificacionMedicion] Primera medición del día para ${rutPaciente}, racha mantenida: ${nuevaRacha}`);
      }
      
      // Sumar puntos a los existentes
      nuevoPuntos = perfilActual.puntos + 20;
    } else {
      // 4. Crear perfil nuevo si no existe
      console.log(`🆕 [procesarGamificacionMedicion] Creando nuevo perfil de gamificación para ${rutPaciente}`);
      
      const fechaActual = new Date();
      const localISOString = new Date(fechaActual.getTime() - fechaActual.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
      
      const nuevoPerfil: GamificacionPerfilCreate = {
        rut_paciente: rutPaciente,
        puntos: 20,
        racha_dias: 1,
        ultima_actividad: localISOString
      };
      
      try {
        await createGamificacionPerfil(nuevoPerfil);
        console.log(`✅ [procesarGamificacionMedicion] Perfil creado exitosamente para ${rutPaciente}`);
        return { 
          success: true, 
          puntosGanados: 20, 
          nuevaRacha: 1 
        };
      } catch (createError) {
        console.error(`❌ [procesarGamificacionMedicion] Error creando perfil para ${rutPaciente}:`, createError);
        return { 
          success: false, 
          error: "Error creando perfil de gamificación" 
        };
      }
    }

    // 5. Actualizar perfil existente
    const fechaActual = new Date();
    const localISOString = new Date(fechaActual.getTime() - fechaActual.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
    
    const updatePayload: GamificacionPerfilUpdate = {
      puntos: nuevoPuntos,
      racha_dias: nuevaRacha,
      ultima_actividad: localISOString
    };

    const updateResult = await updateGamificacionPerfilWithPayload(rutPaciente, updatePayload);
    
    if (updateResult.success) {
      console.log(`✅ [procesarGamificacionMedicion] Gamificación actualizada para ${rutPaciente}: +20 puntos, racha ${nuevaRacha}`);
      
      // Evaluar y otorgar insignias automáticamente
      try {
        const { evaluarYOtorgarInsignias } = await import('./insignia');
        const insigniasResult = await evaluarYOtorgarInsignias(rutPaciente);
        
        if (insigniasResult.success && insigniasResult.insigniasOtorgadas.length > 0) {
          console.log(`🏆 [procesarGamificacionMedicion] ${insigniasResult.insigniasOtorgadas.length} nuevas insignias otorgadas a ${rutPaciente}`);
        } else if (!insigniasResult.success) {
          console.warn(`⚠️ [procesarGamificacionMedicion] Error evaluando insignias para ${rutPaciente}:`, insigniasResult.error);
        }
      } catch (insigniasError) {
        console.warn(`⚠️ [procesarGamificacionMedicion] Error en evaluación de insignias para ${rutPaciente}:`, insigniasError);
      }
      
      return { 
        success: true, 
        puntosGanados: 20, 
        nuevaRacha: nuevaRacha 
      };
    } else {
      return { 
        success: false, 
        error: updateResult.error 
      };
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [procesarGamificacionMedicion] Error procesando gamificación para ${rutPaciente}:`, errorMessage);
    return { 
      success: false, 
      error: `Error procesando gamificación: ${errorMessage}` 
    };
  }
}

/* =========================================================
   ACTUALIZAR PERFIL DE GAMIFICACIÓN CON PAYLOAD COMPLETO
   ========================================================= */

async function updateGamificacionPerfilWithPayload(rutPaciente: string, payload: GamificacionPerfilUpdate): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${RUTA_GAMIFICACION}/${rutPaciente}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      return { success: false, error: errorMessage };
    }

    await response.json(); // Consumir la respuesta
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, error: `Error de conexión: ${errorMessage}` };
  }
}
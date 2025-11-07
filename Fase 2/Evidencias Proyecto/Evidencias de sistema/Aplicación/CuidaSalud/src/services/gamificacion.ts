// src/services/gamificacion.ts

const API_HOST = import.meta.env.VITE_API_HOST ?? "http://127.0.0.1:8000";

const RUTA_GAMIFICACION = `${API_HOST}/gamificacion-perfil`;
const RUTA_MEDICION_ALERTAS = `${API_HOST}/medicion/alertas`;

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

    // Obtener mediciones de la semana actual
    const response = await fetch(`${RUTA_MEDICION_ALERTAS}?` + new URLSearchParams({
      rut_paciente: rutPaciente,
      desde: monday.toISOString(),
      hasta: sunday.toISOString(),
      page: "1",
      page_size: "100"
    }), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const result = await handleResponse<Page<MedicionOut>>(response);
    
    // Contar mediciones únicas por día (evitar duplicados del mismo día)
    const measurementDays = new Set<string>();
    result.items.forEach(medicion => {
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

    // Obtener mediciones (usando endpoint de alertas que permite filtrar por paciente)
    const response = await fetch(`${RUTA_MEDICION_ALERTAS}?` + new URLSearchParams({
      rut_paciente: rutPaciente,
      desde: startDate.toISOString(),
      hasta: endDate.toISOString(),
      page: "1",
      page_size: "100"
    }), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const result = await handleResponse<Page<MedicionOut>>(response);
    
    // Obtener detalles de cada medición
    const measurementsWithDetails = await Promise.all(
      result.items.map(async (medicion) => {
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
    
    measurementsWithDetails.forEach(medicion => {
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
          // Mapeo básico por id_parametro (esto podría mejorarse con códigos)
          switch (detalle.id_parametro) {
            case 1: // Asumiendo que 1 es glucosa
              medicionData.bloodSugar = detalle.valor_num;
              break;
            case 2: // Asumiendo que 2 es presión sistólica
              medicionData.bloodPressure = detalle.valor_num;
              break;
            case 4: // Asumiendo que 4 es oxígeno
              medicionData.oxygen = detalle.valor_num;
              break;
            case 5: // Asumiendo que 5 es temperatura
              medicionData.temperature = detalle.valor_num;
              break;
            default:
              // Para otros parámetros, usar un nombre genérico
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
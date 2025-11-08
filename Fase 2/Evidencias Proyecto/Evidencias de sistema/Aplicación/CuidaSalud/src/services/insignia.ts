// src/services/insignia.ts
const API_HOST = import.meta.env.VITE_API_HOST ?? "http://127.0.0.1:8000";
const RUTA_INSIGNIA = `${API_HOST}/insignia`;
const RUTA_USUARIO_INSIGNIA = `${API_HOST}/usuario-insignia`;

/* =========================================================
   INTERFACES
   ========================================================= */

export interface InsigniaOut {
  id_insignia: number;
  codigo: number;
  nombre_insignia: string;
  descipcion: string;
}

export interface UsuarioInsigniaOut {
  rut_paciente: string;
  id_insignia: number;
  otorgada_en: string;
}

export interface UsuarioInsigniaCreate {
  rut_paciente: string;
  id_insignia: number;
  otorgada_en: string;
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
 * Obtiene todas las insignias disponibles en el sistema
 */
export async function getAllInsignias(): Promise<{ success: boolean; data?: InsigniaOut[]; error?: string }> {
  try {
    console.log(`🏅 [getAllInsignias] Obteniendo todas las insignias disponibles`);
    
    const response = await fetch(`${RUTA_INSIGNIA}?page=1&page_size=100`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      console.error(`❌ [getAllInsignias] Error obteniendo insignias:`, errorMessage);
      return { success: false, error: errorMessage };
    }

    const result = await response.json() as Page<InsigniaOut>;
    console.log(`✅ [getAllInsignias] Obtenidas ${result.items.length} insignias de ${result.total} totales`);
    
    return { 
      success: true, 
      data: result.items 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [getAllInsignias] Error de conexión:`, errorMessage);
    return { 
      success: false, 
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}

/**
 * Obtiene insignias con filtros opcionales
 */
export async function getInsignias(
  page: number = 1, 
  pageSize: number = 20, 
  codigo?: number
): Promise<{ success: boolean; data?: Page<InsigniaOut>; error?: string }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (codigo !== undefined) {
      params.append('codigo', codigo.toString());
    }
    
    console.log(`🏅 [getInsignias] Obteniendo insignias con parámetros:`, { page, pageSize, codigo });
    
    const response = await fetch(`${RUTA_INSIGNIA}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      console.error(`❌ [getInsignias] Error obteniendo insignias:`, errorMessage);
      return { success: false, error: errorMessage };
    }

    const result = await response.json() as Page<InsigniaOut>;
    console.log(`✅ [getInsignias] Página ${page}: ${result.items.length} insignias de ${result.total} totales`);
    
    return { 
      success: true, 
      data: result 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [getInsignias] Error de conexión:`, errorMessage);
    return { 
      success: false, 
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}

/**
 * Obtiene las insignias ganadas por un paciente específico
 */
export async function getInsigniasGanadasPorPaciente(
  rutPaciente: string
): Promise<{ success: boolean; data?: UsuarioInsigniaOut[]; error?: string }> {
  try {
    console.log(`🏆 [getInsigniasGanadasPorPaciente] Obteniendo insignias ganadas por paciente ${rutPaciente}`);
    
    const params = new URLSearchParams({
      rut_paciente: rutPaciente,
      page: "1",
      page_size: "100" // Obtener todas las insignias ganadas
    });
    
    const response = await fetch(`${RUTA_USUARIO_INSIGNIA}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      console.error(`❌ [getInsigniasGanadasPorPaciente] Error obteniendo insignias ganadas:`, errorMessage);
      return { success: false, error: errorMessage };
    }

    const result = await response.json() as Page<UsuarioInsigniaOut>;
    console.log(`✅ [getInsigniasGanadasPorPaciente] Paciente ${rutPaciente} tiene ${result.items.length} insignias ganadas`);
    
    return { 
      success: true, 
      data: result.items 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [getInsigniasGanadasPorPaciente] Error de conexión:`, errorMessage);
    return { 
      success: false, 
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}

/**
 * Verifica si un paciente ya tiene una insignia específica
 */
export async function verificarInsigniaGanada(
  rutPaciente: string, 
  idInsignia: number
): Promise<{ success: boolean; tieneInsignia: boolean; error?: string }> {
  try {
    console.log(`🔍 [verificarInsigniaGanada] Verificando si paciente ${rutPaciente} tiene insignia ${idInsignia}`);
    
    const response = await fetch(`${RUTA_USUARIO_INSIGNIA}/${rutPaciente}/${idInsignia}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });

    if (response.status === 404) {
      // No tiene la insignia (404 = Not found)
      console.log(`ℹ️ [verificarInsigniaGanada] Paciente ${rutPaciente} NO tiene insignia ${idInsignia}`);
      return { success: true, tieneInsignia: false };
    }

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      console.error(`❌ [verificarInsigniaGanada] Error verificando insignia:`, errorMessage);
      return { success: false, tieneInsignia: false, error: errorMessage };
    }

    // Si llegamos aquí, tiene la insignia
    console.log(`✅ [verificarInsigniaGanada] Paciente ${rutPaciente} SÍ tiene insignia ${idInsignia}`);
    return { success: true, tieneInsignia: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [verificarInsigniaGanada] Error de conexión:`, errorMessage);
    return { 
      success: false, 
      tieneInsignia: false,
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}

/**
 * Evalúa y otorga insignias automáticamente basado en el perfil de gamificación
 */
export async function evaluarYOtorgarInsignias(
  rutPaciente: string
): Promise<{ success: boolean; insigniasOtorgadas: number[]; error?: string }> {
  try {
    console.log(`🎯 [evaluarYOtorgarInsignias] Evaluando insignias para paciente ${rutPaciente}`);
    
    // 1. Obtener perfil de gamificación del paciente
    const { getGamificacionPerfilDetallado } = await import('./gamificacion');
    const perfilResult = await getGamificacionPerfilDetallado(rutPaciente);
    
    if (!perfilResult) {
      console.warn(`⚠️ [evaluarYOtorgarInsignias] No se encontró perfil de gamificación para ${rutPaciente}`);
      return { success: false, insigniasOtorgadas: [], error: "Perfil de gamificación no encontrado" };
    }

    console.log(`📊 [evaluarYOtorgarInsignias] Perfil obtenido - Puntos: ${perfilResult.puntos}, Racha: ${perfilResult.racha_dias} días`);
    
    const insigniasParaOtorgar: { id: number, codigo: number, razon: string }[] = [];
    
    // 2. Evaluar reglas de negocio
    
    // Regla 1: Código 100 (ID 1) - Si tiene puntos > 0 (primer medición/toma)
    if (perfilResult.puntos > 0) {
      insigniasParaOtorgar.push({
        id: 1,
        codigo: 100,
        razon: `Primera medición registrada (${perfilResult.puntos} puntos)`
      });
    }
    
    // Regla 2: Código 200 (ID 2) - Si tiene 7+ días de racha
    if (perfilResult.racha_dias >= 7) {
      insigniasParaOtorgar.push({
        id: 2,
        codigo: 200,
        razon: `Constante - ${perfilResult.racha_dias} días de racha consecutiva`
      });
    }

    console.log(`🎲 [evaluarYOtorgarInsignias] Insignias candidatas: ${insigniasParaOtorgar.length}`);
    
    // 3. Verificar cuáles no tiene y otorgar
    const insigniasOtorgadas: number[] = [];
    
    for (const insignia of insigniasParaOtorgar) {
      const verificacion = await verificarInsigniaGanada(rutPaciente, insignia.id);
      
      if (!verificacion.success) {
        console.warn(`⚠️ [evaluarYOtorgarInsignias] Error verificando insignia ${insignia.id}:`, verificacion.error);
        continue;
      }
      
      if (!verificacion.tieneInsignia) {
        // No tiene la insignia, intentar otorgarla
        console.log(`🏅 [evaluarYOtorgarInsignias] Otorgando insignia ${insignia.id} (${insignia.codigo}) - ${insignia.razon}`);
        
        const otorgamiento = await otorgarInsignia(rutPaciente, insignia.id);
        
        if (otorgamiento.success) {
          insigniasOtorgadas.push(insignia.id);
          console.log(`✅ [evaluarYOtorgarInsignias] Insignia ${insignia.id} otorgada exitosamente`);
        } else {
          console.error(`❌ [evaluarYOtorgarInsignias] Error otorgando insignia ${insignia.id}:`, otorgamiento.error);
        }
      } else {
        console.log(`ℹ️ [evaluarYOtorgarInsignias] Insignia ${insignia.id} ya otorgada previamente`);
      }
    }
    
    console.log(`🎉 [evaluarYOtorgarInsignias] Proceso completado - ${insigniasOtorgadas.length} nuevas insignias otorgadas`);
    
    return { 
      success: true, 
      insigniasOtorgadas 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [evaluarYOtorgarInsignias] Error en evaluación:`, errorMessage);
    return { 
      success: false, 
      insigniasOtorgadas: [],
      error: `Error evaluando insignias: ${errorMessage}` 
    };
  }
}

/**
 * Otorga una insignia específica a un paciente
 */
async function otorgarInsignia(
  rutPaciente: string, 
  idInsignia: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🏆 [otorgarInsignia] Otorgando insignia ${idInsignia} a paciente ${rutPaciente}`);
    
    // Crear payload con fecha actual
    const now = new Date();
    const payload: UsuarioInsigniaCreate = {
      rut_paciente: rutPaciente,
      id_insignia: idInsignia,
      otorgada_en: now.toISOString()
    };
    
    const response = await fetch(RUTA_USUARIO_INSIGNIA, {
      method: 'POST',
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
      
      console.error(`❌ [otorgarInsignia] Error otorgando insignia ${idInsignia} a ${rutPaciente}:`, errorMessage);
      return { success: false, error: errorMessage };
    }

    const result = await response.json() as UsuarioInsigniaOut;
    console.log(`✅ [otorgarInsignia] Insignia ${idInsignia} otorgada exitosamente a ${rutPaciente} en ${result.otorgada_en}`);
    
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [otorgarInsignia] Error de conexión otorgando insignia:`, errorMessage);
    return { 
      success: false, 
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}
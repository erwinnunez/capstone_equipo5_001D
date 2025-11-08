// src/services/paciente.ts

import { calcularDV } from '../utils/rut';

const API_HOST = import.meta.env.VITE_API_HOST ?? "http://127.0.0.1:8000";

const RUTA_PACIENTE = `${API_HOST}/paciente`;
const RUTA_PACIENTE_HISTORIAL = `${API_HOST}/paciente-historial`;
const RUTA_MEDICION = `${API_HOST}/medicion`;
const RUTA_MEDICION_DETALLE = `${API_HOST}/medicion-detalle`;

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

// Función para verificar si existe un paciente por RUT
const checkPacienteByRut = async (rut: string): Promise<boolean> => {
  try {
    // Suprimimos logs de 404 temporalmente ya que es comportamiento esperado
    const originalConsoleError = console.error;
    console.error = () => {}; // Silenciar errores de consola durante esta verificación
    
    const response = await fetch(`${RUTA_PACIENTE}/${rut}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Restaurar console.error
    console.error = originalConsoleError;
    
    // Si responde 200, el paciente existe
    if (response.ok) {
      return true;
    }
    
    // Si responde 404, el paciente no existe (comportamiento esperado)
    if (response.status === 404) {
      return false;
    }
    
    // Otros errores
    throw new Error(`Error al verificar RUT: ${response.status}`);
  } catch (error) {
    // Restaurar console.error por si acaso
    console.error = console.error || (() => {});
    
    // Si hay error de conexión, lo re-lanzamos
    if (error instanceof TypeError) {
      throw new Error('Error de conexión al verificar RUT');
    }
    throw error;
  }
};

// Función para verificar si existe un paciente por email
const checkPacienteByEmail = async (email: string): Promise<boolean> => {
  try {
    // Suprimimos logs de 404 temporalmente ya que es comportamiento esperado
    const originalConsoleError = console.error;
    console.error = () => {}; // Silenciar errores de consola durante esta verificación
    
    const response = await fetch(`${RUTA_PACIENTE}/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Restaurar console.error
    console.error = originalConsoleError;
    
    // Si responde 200, el paciente existe
    if (response.ok) {
      return true;
    }
    
    // Si responde 404, el paciente no existe (comportamiento esperado)
    if (response.status === 404) {
      return false;
    }
    
    // Otros errores
    throw new Error(`Error al verificar email: ${response.status}`);
  } catch (error) {
    // Restaurar console.error por si acaso
    console.error = console.error || (() => {});
    
    // Si hay error de conexión, lo re-lanzamos
    if (error instanceof TypeError) {
      throw new Error('Error de conexión al verificar email');
    }
    throw error;
  }
};

/* =========================================================
   ===============  REGISTRO DE PACIENTE  ==================
   ========================================================= */

// Tipado alineado con tu schema PacienteCreate
export type PacienteCreatePayload = {
  rut_paciente: string;
  id_comuna: number;

  primer_nombre_paciente: string;
  segundo_nombre_paciente: string;
  primer_apellido_paciente: string;
  segundo_apellido_paciente: string;

  fecha_nacimiento: string; // ISO "YYYY-MM-DD" o con tz
  sexo: boolean;
  tipo_de_sangre: string;   // "O+", "A-", etc
  enfermedades?: string | null;
  seguro?: string | null;

  direccion: string;
  telefono: number;
  email: string;
  contrasena: string;

  tipo_paciente: string;
  nombre_contacto: string;
  telefono_contacto: number;

  estado: boolean;

  id_cesfam: number;
  fecha_inicio_cesfam: string; // "YYYY-MM-DD"
  fecha_fin_cesfam?: string | null; // opcional
  activo_cesfam: boolean;
};

// Estructura que devuelve el backend (ajústala si tienes más campos)
export type PacienteOut = {
  rut_paciente: string;
  id_comuna: number;
  primer_nombre_paciente: string;
  segundo_nombre_paciente: string | null;
  primer_apellido_paciente: string;
  segundo_apellido_paciente: string | null;
  fecha_nacimiento: string;        // ISO
  sexo: boolean | null;            // true M / false F / null desconocido
  tipo_de_sangre: string | null;
  enfermedades: string | null;
  seguro: string | null;
  direccion: string | null;
  telefono: number | null;
  email: string | null;
  tipo_paciente: string | null;
  nombre_contacto: string | null;
  telefono_contacto: number | null;
  estado: boolean;
  id_cesfam: number | null;
  fecha_inicio_cesfam: string | null;
  fecha_fin_cesfam: string | null;
  activo_cesfam: boolean | null;
};

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; details?: any };

// Convierte el detail 422 de FastAPI a un string legible
export function toNiceMessage(err: any): string {
  if (err?.detail) {
    const det = err.detail;
    if (Array.isArray(det)) {
      return det
        .map((d) => {
          const loc = Array.isArray(d.loc) ? d.loc.join(".") : String(d.loc ?? "");
          return loc ? `${loc}: ${d.msg}` : d.msg;
        })
        .join(" | ");
    }
    return typeof det === "string" ? det : JSON.stringify(det);
  }
  return "Error de validación";
}

import { 
  createGamificacionPerfilSafe, 
  type GamificacionPerfilCreate 
} from './gamificacion';
import { enviarEmailBienvenida } from './email';

// Crear Paciente
export async function createPaciente(payload: PacienteCreatePayload): Promise<ApiResult<any>> {
  console.log("Creando paciente:", payload);
  
  try {
    // 1. Verificar si ya existe un paciente con ese RUT
    console.log("🔍 Verificando RUT:", payload.rut_paciente);
    const rutExists = await checkPacienteByRut(payload.rut_paciente);
    if (rutExists) {
      return {
        ok: false,
        status: 409,
        message: "Ya existe un paciente registrado con este RUT",
        details: null
      };
    }
    
    // 2. Verificar si ya existe un paciente con ese email
    console.log("📧 Verificando email:", payload.email);
    const emailExists = await checkPacienteByEmail(payload.email);
    if (emailExists) {
      return {
        ok: false,
        status: 409,
        message: "El correo electrónico ya está registrado en el sistema",
        details: null
      };
    }
    
    console.log("✅ RUT y email disponibles, procediendo a crear paciente");
    
    // 3. Crear el paciente (ahora sabemos que no hay duplicados)
    const res = await fetch(RUTA_PACIENTE, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    
    // Manejar errores del servidor
    if (!res.ok) {
      let errorMessage = "Error al crear el paciente";
      let errorDetails = null;
      
      try {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        
        // Manejar diferentes formatos de error
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Error de validación con detalles
            errorMessage = errorData.detail.map((d: any) => {
              const loc = Array.isArray(d.loc) ? d.loc.join(".") : String(d.loc ?? "");
              return loc ? `${loc}: ${d.msg}` : d.msg;
            }).join(" | ");
            errorDetails = errorData.detail;
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
        errorMessage = `Error ${res.status}: ${res.statusText}`;
      }
      
      return {
        ok: false,
        status: res.status,
        message: errorMessage,
        details: errorDetails
      };
    }
    
    const result = await res.json();
    const successResult = { ok: true, data: result, status: res.status, message: "Paciente creado exitosamente" };

    // 4. Si el paciente se creó exitosamente, intentar crear su perfil de gamificación
    if (successResult.ok) {
      // Crear fecha en formato "YYYY-MM-DD HH:MM:SS.ssssss"
      const now = new Date();
      const fechaFormateada = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0') + ' ' + 
        String(now.getHours()).padStart(2, '0') + ':' + 
        String(now.getMinutes()).padStart(2, '0') + ':' + 
        String(now.getSeconds()).padStart(2, '0') + '.' + 
        String(now.getMilliseconds() * 1000).padStart(6, '0');
      
      const gamificacionPayload: GamificacionPerfilCreate = {
        rut_paciente: payload.rut_paciente,
        puntos: 0,
        racha_dias: 0,
        ultima_actividad: fechaFormateada
      };
      
      const gamificacionResult = await createGamificacionPerfilSafe(gamificacionPayload);
      
      if (gamificacionResult.success) {
        console.log("✅ Perfil de gamificación creado para paciente:", payload.rut_paciente);
      } else {
        console.warn("⚠️ No se pudo crear el perfil de gamificación (no crítico):", {
          paciente: payload.rut_paciente,
          error: gamificacionResult.error,
          info: "El paciente fue creado exitosamente. La gamificación se puede configurar manualmente más tarde."
        });
      }

      // 5. Enviar email de bienvenida al paciente
      try {
        console.log("📧 Enviando email de bienvenida a paciente:", payload.email);
        const emailData = {
          to: payload.email,
          patient_name: `${payload.primer_nombre_paciente} ${payload.primer_apellido_paciente}`,
          rut: payload.rut_paciente,
          temporary_password: "Su contraseña inicial" // O generar una temporal si es necesario
        };
        await enviarEmailBienvenida(emailData);
        console.log("✅ Email de bienvenida enviado exitosamente a:", payload.email);
      } catch (emailError) {
        console.warn("⚠️ No se pudo enviar email de bienvenida (no crítico):", {
          email: payload.email,
          error: emailError,
          info: "El paciente fue registrado exitosamente. El email se puede enviar manualmente."
        });
      }
    }
    
    return successResult;
  } catch (error: any) {
    console.error("❌ Error al crear paciente:", error);
    
    // Manejar errores de conexión/CORS
    let errorMessage = "Error de conexión con el servidor";
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = "No se puede conectar con el servidor. Verifique su conexión a internet.";
    } else if (error.message?.includes('CORS')) {
      errorMessage = "Error de configuración del servidor (CORS)";
    } else {
      errorMessage = error.message || "Error desconocido al crear paciente";
    }
    
    return {
      ok: false,
      status: 0,
      message: errorMessage,
      details: error
    };
  }
}

/* =========================================================
   ===============         PACIENTES          ==============
   ========================================================= */

export async function getPacientes<T = PacienteOut[]>(): Promise<T> {
  const resp = await fetch(RUTA_PACIENTE, {
    method: "GET",
    headers: { "content-type": "application/json" },
    credentials: "include",
  });
  return handleResponse(resp);
}

// Nueva función para listado con paginación y filtros
export async function listPacientes(params: {
  page?: number;
  page_size?: number;
  id_cesfam?: number;
  id_comuna?: number;
  estado?: boolean;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
}): Promise<Page<PacienteOut>> {
  const qs = buildQuery({
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    id_cesfam: params.id_cesfam,
    id_comuna: params.id_comuna,
    estado: params.estado,
    primer_nombre: params.primer_nombre,
    segundo_nombre: params.segundo_nombre,
    primer_apellido: params.primer_apellido,
    segundo_apellido: params.segundo_apellido,
  });

  const resp = await fetch(`${RUTA_PACIENTE}?${qs}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    credentials: "include",
  });
  return handleResponse<Page<PacienteOut>>(resp);
}

export async function getPacienteByRut(rut_paciente: string): Promise<ApiResult<PacienteOut>> {
  try {
    const response = await fetch(`${RUTA_PACIENTE}/${rut_paciente}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });
    
    // Si encuentra el paciente
    if (response.ok) {
      const data = await response.json();
      return {
        ok: true,
        data: data
      };
    }
    
    // Si no encuentra el paciente (404)
    if (response.status === 404) {
      return {
        ok: false,
        status: 404,
        message: "Paciente no encontrado",
        details: null
      };
    }
    
    // Otros errores del servidor
    let errorMessage = "Error al buscar paciente";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || `Error ${response.status}`;
    } catch {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    
    return {
      ok: false,
      status: response.status,
      message: errorMessage,
      details: null
    };
    
  } catch (error: any) {
    console.error("❌ Error al buscar paciente por RUT:", error);
    
    // Manejar errores de conexión/CORS
    let errorMessage = "Error de conexión con el servidor";
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = "No se puede conectar con el servidor. Verifique su conexión a internet.";
    } else if (error.message?.includes('CORS')) {
      errorMessage = "Error de configuración del servidor (CORS)";
    } else {
      errorMessage = error.message || "Error desconocido al buscar paciente";
    }
    
    return {
      ok: false,
      status: 0,
      message: errorMessage,
      details: error
    };
  }
}

// Alias opcional, por si prefieres importar esto
export const getPacienteFicha = getPacienteByRut;

/* =========================================================
   ===============       MEDICIONES           ==============
   ========================================================= */
/**
 * Si ya estás usando `src/services/medicion.ts` (recomendado),
 * puedes ELIMINAR todo lo de mediciones de este archivo para evitar duplicados.
 * Lo dejo aquí solo si aún no migras.
 */

export type Severidad = "normal" | "warning" | "critical";

export interface MedicionCreatePayload {
  rut_paciente: string;
  fecha_registro: string;  // ISO
  origen: string;
  registrado_por: string;
  observacion: string;
  evaluada_en: string;     // ISO
  tiene_alerta: boolean;
  severidad_max: Severidad | string;
  resumen_alerta: string;
}

export interface MedicionOut extends MedicionCreatePayload {
  id_medicion: number;
}

export interface MedicionDetalleCreatePayload {
  id_medicion: number;
  id_parametro: number;
  id_unidad: number;
  valor_num: number;
  valor_texto: string;
  fuera_rango: boolean;
  severidad: Severidad | string;
  umbral_min: number;
  umbral_max: number;
  tipo_alerta: string;
}

export interface MedicionDetalleOut extends MedicionDetalleCreatePayload {
  id_detalle: number;
}

export async function createMedicion(
  payload: MedicionCreatePayload
): Promise<MedicionOut> {
  const resp = await fetch(RUTA_MEDICION, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse<MedicionOut>(resp);
}

export async function createMedicionDetalle(
  payload: MedicionDetalleCreatePayload
): Promise<MedicionDetalleOut> {
  const resp = await fetch(RUTA_MEDICION_DETALLE, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse<MedicionDetalleOut>(resp);
}

/**
 * Crea una medición y, después, sus detalles.
 * `input.detalles` NO incluye id_medicion; se inyecta el id creado.
 */
export async function createMedicionWithDetails(input: {
  medicion: MedicionCreatePayload;
  detalles: Omit<MedicionDetalleCreatePayload, "id_medicion">[];
}): Promise<{ medicion: MedicionOut; detalles: MedicionDetalleOut[] }> {
  const med = await createMedicion(input.medicion);
  const detallesOut: MedicionDetalleOut[] = [];

  for (const d of input.detalles) {
    const det = await createMedicionDetalle({ ...d, id_medicion: med.id_medicion });
    detallesOut.push(det);
  }
  return { medicion: med, detalles: detallesOut };
}

/* =========================================================
   ===============      LISTADOS (GET)       ===============
   ========================================================= */

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  return q.toString();
}

export async function listMediciones(params: {
  rut_paciente?: string;
  desde?: string;        // ISO
  hasta?: string;        // ISO
  tiene_alerta?: boolean;
  page?: number;
  page_size?: number;
}): Promise<Page<MedicionOut>> {
  const qs = buildQuery({
    rut_paciente: params.rut_paciente,
    desde: params.desde,
    hasta: params.hasta,
    tiene_alerta: params.tiene_alerta,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
  });

  const resp = await fetch(`${RUTA_MEDICION}?${qs}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    credentials: "include",
  });
  return handleResponse<Page<MedicionOut>>(resp);
}

export async function listMedicionDetalles(params: {
  id_medicion?: number;
  id_parametro?: number;
  page?: number;
  page_size?: number;
}): Promise<Page<MedicionDetalleOut>> {
  const qs = buildQuery({
    id_medicion: params.id_medicion,
    id_parametro: params.id_parametro,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
  });

  const resp = await fetch(`${RUTA_MEDICION_DETALLE}?${qs}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    credentials: "include",
  });
  return handleResponse<Page<MedicionDetalleOut>>(resp);
}

// ===== Helper específico: listar SOLO mediciones con alerta = true =====
export async function listAlertasMediciones(params?: {
  rut_paciente?: string;
  desde?: string; // ISO
  hasta?: string; // ISO
  page?: number;
  page_size?: number;
}) {
  return listMediciones({
    rut_paciente: params?.rut_paciente,
    desde: params?.desde,
    hasta: params?.hasta,
    tiene_alerta: true,
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 50,
  });
}

// ===== Función para crear historial de paciente =====
export async function createPacienteHistorial(rutPaciente: string, cambio: string, resultado: boolean) {
  // El backend del historial de pacientes requiere RUT sin guión pero con DV válido
  let rutValido = rutPaciente.replace('-', '');
  
  // Si el RUT no tiene dígito verificador (solo números de 8 dígitos), calcularlo
  if (/^\d{8}$/.test(rutValido)) {
    const dv = calcularDV(rutValido);
    rutValido = `${rutValido}${dv}`;
  }
  
  const payload = {
    rut_paciente: rutValido,
    fecha_cambio: new Date().toISOString(),
    cambio: cambio,
    resultado: resultado
  };

  const response = await fetch(RUTA_PACIENTE_HISTORIAL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en historial paciente: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

// ===== Función para actualizar paciente =====
export async function updatePaciente(rut: string, payload: any) {
  // 1. Actualizar el paciente (operación principal)
  const response = await fetch(`${RUTA_PACIENTE}/${rut}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  
  const result = await handleResponse(response);
  
  // 2. Crear historial del cambio (no crítico)
  try {
    const camposModificados = Object.keys(payload);
    let descripcion = '';
    
    // Crear descripción más detallada para pacientes
    const tiposDeCampos = {
      nombres: camposModificados.filter(campo => 
        campo.includes('nombre') || campo.includes('apellido')
      ),
      contacto: camposModificados.filter(campo => 
        campo.includes('telefono') || campo.includes('direccion') || campo.includes('email')
      ),
      salud: camposModificados.filter(campo => 
        campo.includes('sangre') || campo.includes('enfermedad') || campo.includes('seguro')
      ),
      emergencia: camposModificados.filter(campo => 
        campo.includes('contacto')
      ),
      otros: camposModificados.filter(campo => 
        !campo.includes('nombre') && !campo.includes('apellido') && 
        !campo.includes('telefono') && !campo.includes('direccion') && !campo.includes('email') &&
        !campo.includes('sangre') && !campo.includes('enfermedad') && !campo.includes('seguro') &&
        !campo.includes('contacto')
      )
    };
    
    const partes = [];
    if (tiposDeCampos.nombres.length > 0) partes.push('nombres');
    if (tiposDeCampos.contacto.length > 0) partes.push('datos de contacto');
    if (tiposDeCampos.salud.length > 0) partes.push('información médica');
    if (tiposDeCampos.emergencia.length > 0) partes.push('contacto de emergencia');
    if (tiposDeCampos.otros.length > 0) partes.push('otros datos');
    
    if (partes.length === 1) {
      descripcion = `Actualización de ${partes[0]}`;
    } else if (partes.length === 2) {
      descripcion = `Actualización de ${partes.join(' y ')}`;
    } else {
      descripcion = `Actualización de ${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
    }
    
    // Asegurar que no exceda 200 caracteres
    if (descripcion.length > 200) {
      descripcion = descripcion.substring(0, 197) + '...';
    }
    
    await createPacienteHistorial(rut, descripcion, true);
  } catch (historialError) {
    console.warn('No se pudo guardar el historial del paciente:', historialError);
    // No lanzar error, la operación principal ya fue exitosa
  }
  
  return result;
}

// ===== Función para activar/desactivar paciente =====
export async function togglePacienteStatus(rut: string, estado: boolean) {
  // 1. Cambiar el estado del paciente (operación principal)
  const response = await fetch(`${RUTA_PACIENTE}/${rut}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
    body: JSON.stringify({ estado }),
  });
  
  const result = await handleResponse(response);
  
  // 2. Crear historial del cambio de estado (no crítico)
  try {
    const accion = estado ? 'activado' : 'desactivado';
    await createPacienteHistorial(rut, `Usuario ${accion}`, true);
  } catch (historialError) {
    console.warn('No se pudo guardar el historial del cambio de estado:', historialError);
    // No lanzar error, la operación principal ya fue exitosa
  }
  
  return result;
}

// ===== Función para obtener historial de pacientes =====
export async function getPacienteHistorial(params?: { 
  page?: number; 
  page_size?: number; 
  rut_paciente?: string; 
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.rut_paciente) queryParams.append('rut_paciente', params.rut_paciente);
  
  const url = `${RUTA_PACIENTE_HISTORIAL}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
  });
  
  return handleResponse(response);
}

// ===== Función para obtener total de pacientes =====
export async function getTotalPacientes() {
  const response = await fetch(`${RUTA_PACIENTE}?page=1&page_size=1`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
  });
  
  const result = await handleResponse(response) as { total?: number };
  return result.total || 0;
}

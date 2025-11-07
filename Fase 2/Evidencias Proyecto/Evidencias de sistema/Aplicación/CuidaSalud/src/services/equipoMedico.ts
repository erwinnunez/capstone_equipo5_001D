// src/services/equipoMedico.ts
// Servicio para crear médicos (incluye is_admin)

const API_HOST = "http://127.0.0.1:8000";
const RUTA_EQUIPO_MEDICO = `${API_HOST}/equipo-medico`;

// Función para verificar si existe un médico por RUT
const checkMedicoByRut = async (rut: string): Promise<boolean> => {
  try {
    // Suprimimos logs de 404 temporalmente ya que es comportamiento esperado
    const originalConsoleError = console.error;
    console.error = () => {}; // Silenciar errores de consola durante esta verificación
    
    const response = await fetch(`${RUTA_EQUIPO_MEDICO}/${rut}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Restaurar console.error
    console.error = originalConsoleError;
    
    // Si responde 200, el médico existe
    if (response.ok) {
      return true;
    }
    
    // Si responde 404, el médico no existe (comportamiento esperado)
    if (response.status === 404) {
      return false;
    }
    
    // Otros errores
    throw new Error(`Error al verificar RUT de médico: ${response.status}`);
  } catch (error) {
    // Restaurar console.error por si acaso
    console.error = console.error || (() => {});
    
    // Si hay error de conexión, lo re-lanzamos
    if (error instanceof TypeError) {
      throw new Error('Error de conexión al verificar RUT de médico');
    }
    throw error;
  }
};

// Función para verificar si existe un médico por email
const checkMedicoByEmail = async (email: string): Promise<boolean> => {
  try {
    // Suprimimos logs de 404 temporalmente ya que es comportamiento esperado
    const originalConsoleError = console.error;
    console.error = () => {}; // Silenciar errores de consola durante esta verificación
    
    const response = await fetch(`${RUTA_EQUIPO_MEDICO}/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Restaurar console.error
    console.error = originalConsoleError;
    
    // Si responde 200, el médico existe
    if (response.ok) {
      return true;
    }
    
    // Si responde 404, el médico no existe (comportamiento esperado)
    if (response.status === 404) {
      return false;
    }
    
    // Otros errores
    throw new Error(`Error al verificar email de médico: ${response.status}`);
  } catch (error) {
    // Restaurar console.error por si acaso
    console.error = console.error || (() => {});
    
    // Si hay error de conexión, lo re-lanzamos
    if (error instanceof TypeError) {
      throw new Error('Error de conexión al verificar email de médico');
    }
    throw error;
  }
};

export type EquipoMedicoCreatePayload = {
  rut_medico: string; // 9 dígitos, sin puntos/guion
  id_cesfam: number;
  primer_nombre_medico: string;
  segundo_nombre_medico?: string | null; // null si vacío
  primer_apellido_medico: string;
  segundo_apellido_medico: string;
  email: string;
  contrasenia: string; // mínimo 8, con Aa1
  telefono: number; // 9 dígitos
  direccion: string;
  rol: string; // "medico"
  especialidad: string;
  estado: boolean;
  is_admin?: boolean;
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

/**
 * Crea un médico. Para administrador, pasa is_admin=true.
 */
export async function createMedico(
  payload: EquipoMedicoCreatePayload,
  token?: string // si usas JWT
): Promise<ApiResult<any>> {
  console.log("Creando médico/administrador:", payload);
  
  try {
    // 1. Verificar si ya existe un médico con ese RUT
    console.log("🔍 Verificando RUT de médico:", payload.rut_medico);
    const rutExists = await checkMedicoByRut(payload.rut_medico);
    if (rutExists) {
      return {
        ok: false,
        status: 409,
        message: "Ya existe un médico/administrador registrado con este RUT",
        details: null
      };
    }
    
    // 2. Verificar si ya existe un médico con ese email
    console.log("📧 Verificando email de médico:", payload.email);
    const emailExists = await checkMedicoByEmail(payload.email);
    if (emailExists) {
      return {
        ok: false,
        status: 409,
        message: "El correo electrónico ya está registrado en el sistema",
        details: null
      };
    }
    
    console.log("✅ RUT y email de médico disponibles, procediendo a crear");
    
    // 3. Crear el médico/administrador (ahora sabemos que no hay duplicados)
    const res = await fetch(RUTA_EQUIPO_MEDICO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    
    // Manejar errores del servidor
    if (!res.ok) {
      let errorMessage = "Error al crear el médico/administrador";
      
      try {
        const errorData = await res.json();
        if (res.status === 422 && errorData?.detail) {
          errorMessage = toNiceMessage(errorData);
        } else {
          errorMessage = errorData.detail || errorData.message || `Error ${res.status}`;
        }
      } catch {
        errorMessage = `Error ${res.status}: ${res.statusText}`;
      }
      
      return {
        ok: false,
        status: res.status,
        message: errorMessage,
        details: null
      };
    }
    
    const result = await res.json();
    return {
      ok: true,
      data: result
    };
    
  } catch (error: any) {
    console.error("❌ Error al crear médico/administrador:", error);
    
    // Manejar errores de conexión/CORS
    let errorMessage = "Error de conexión con el servidor";
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = "No se puede conectar con el servidor. Verifique su conexión a internet.";
    } else if (error.message?.includes('CORS')) {
      errorMessage = "Error de configuración del servidor (CORS)";
    } else {
      errorMessage = error.message || "Error desconocido al crear médico/administrador";
    }
    
    return {
      ok: false,
      status: 0,
      message: errorMessage,
      details: error
    };
  }
}

// Tipo para la estructura de Page que devuelve el backend
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

// Función helper para construir query params
function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  return q.toString();
}

// Función para manejar respuestas básicas
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

// Nueva función para listado con paginación y filtros
export async function listMedicos(params: {
  page?: number;
  page_size?: number;
  id_cesfam?: number;
  estado?: boolean;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  is_admin?: boolean;
}): Promise<Page<any>> {
  const qs = buildQuery({
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    id_cesfam: params.id_cesfam,
    estado: params.estado,
    primer_nombre: params.primer_nombre,
    segundo_nombre: params.segundo_nombre,
    primer_apellido: params.primer_apellido,
    segundo_apellido: params.segundo_apellido,
    is_admin: params.is_admin,
  });

  const resp = await fetch(`${RUTA_EQUIPO_MEDICO}?${qs}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  return handleResponse<Page<any>>(resp);
}

// ===== Función para actualizar médico =====
export async function updateMedico(rut: string, payload: any) {
  const response = await fetch(`${RUTA_EQUIPO_MEDICO}/${rut}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

// ===== Función para activar/desactivar médico =====
export async function toggleMedicoStatus(rut: string, estado: boolean) {
  const response = await fetch(`${RUTA_EQUIPO_MEDICO}/${rut}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ estado }),
  });
  return handleResponse(response);
}

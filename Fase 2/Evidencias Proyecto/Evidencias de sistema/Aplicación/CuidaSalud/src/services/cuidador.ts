// src/services/cuidador.ts
// Servicio de Cuidador: crear (registro)
// Compatible con schema CuidadorCreate del backend

const API_HOST = "http://127.0.0.1:8000";
const RUTA_CUIDADOR = `${API_HOST}/cuidador`;

// Función para verificar si existe un cuidador por RUT
const checkCuidadorByRut = async (rut: string): Promise<boolean> => {
  try {
    // Suprimimos logs de 404 temporalmente ya que es comportamiento esperado
    const originalConsoleError = console.error;
    console.error = () => {}; // Silenciar errores de consola durante esta verificación
    
    const response = await fetch(`${RUTA_CUIDADOR}/${rut}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Restaurar console.error
    console.error = originalConsoleError;
    
    // Si responde 200, el cuidador existe
    if (response.ok) {
      return true;
    }
    
    // Si responde 404, el cuidador no existe (comportamiento esperado)
    if (response.status === 404) {
      return false;
    }
    
    // Otros errores
    throw new Error(`Error al verificar RUT de cuidador: ${response.status}`);
  } catch (error) {
    // Restaurar console.error por si acaso
    console.error = console.error || (() => {});
    
    // Si hay error de conexión, lo re-lanzamos
    if (error instanceof TypeError) {
      throw new Error('Error de conexión al verificar RUT de cuidador');
    }
    throw error;
  }
};

// Función para verificar si existe un cuidador por email
const checkCuidadorByEmail = async (email: string): Promise<boolean> => {
  try {
    // Suprimimos logs de 404 temporalmente ya que es comportamiento esperado
    const originalConsoleError = console.error;
    console.error = () => {}; // Silenciar errores de consola durante esta verificación
    
    const response = await fetch(`${RUTA_CUIDADOR}/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Restaurar console.error
    console.error = originalConsoleError;
    
    // Si responde 200, el cuidador existe
    if (response.ok) {
      return true;
    }
    
    // Si responde 404, el cuidador no existe (comportamiento esperado)
    if (response.status === 404) {
      return false;
    }
    
    // Otros errores
    throw new Error(`Error al verificar email de cuidador: ${response.status}`);
  } catch (error) {
    // Restaurar console.error por si acaso
    console.error = console.error || (() => {});
    
    // Si hay error de conexión, lo re-lanzamos
    if (error instanceof TypeError) {
      throw new Error('Error de conexión al verificar email de cuidador');
    }
    throw error;
  }
};

export type CuidadorCreatePayload = {
  rut_cuidador: string; // <-- string sin . ni -
  primer_nombre_cuidador: string;
  segundo_nombre_cuidador: string;
  primer_apellido_cuidador: string;
  segundo_apellido_cuidador: string;
  sexo: boolean;
  direccion: string;
  telefono: number;
  email: string;
  contrasena: string;
  estado: boolean;
};

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; details?: any };

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

export async function createCuidador(payload: CuidadorCreatePayload): Promise<ApiResult<any>> {
  console.log("Creando cuidador:", payload);
  
  try {
    // 1. Verificar si ya existe un cuidador con ese RUT
    console.log("🔍 Verificando RUT de cuidador:", payload.rut_cuidador);
    const rutExists = await checkCuidadorByRut(payload.rut_cuidador);
    if (rutExists) {
      return {
        ok: false,
        status: 409,
        message: "Ya existe un cuidador registrado con este RUT",
        details: null
      };
    }
    
    // 2. Verificar si ya existe un cuidador con ese email
    console.log("📧 Verificando email de cuidador:", payload.email);
    const emailExists = await checkCuidadorByEmail(payload.email);
    if (emailExists) {
      return {
        ok: false,
        status: 409,
        message: "El correo electrónico ya está registrado en el sistema",
        details: null
      };
    }
    
    console.log("✅ RUT y email de cuidador disponibles, procediendo a crear");
    
    // 3. Crear el cuidador (ahora sabemos que no hay duplicados)
    const res = await fetch(RUTA_CUIDADOR, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    // Manejar errores del servidor
    if (!res.ok) {
      let errorMessage = "Error al crear el cuidador";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorData.message || `Error ${res.status}`;
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
    console.error("❌ Error al crear cuidador:", error);
    
    // Manejar errores de conexión/CORS
    let errorMessage = "Error de conexión con el servidor";
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = "No se puede conectar con el servidor. Verifique su conexión a internet.";
    } else if (error.message?.includes('CORS')) {
      errorMessage = "Error de configuración del servidor (CORS)";
    } else {
      errorMessage = error.message || "Error desconocido al crear cuidador";
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

// Función para manejar respuestas con el tipo ApiResult
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
export async function listCuidadores(params: {
  page?: number;
  page_size?: number;
  estado?: boolean;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
}): Promise<Page<any>> {
  const qs = buildQuery({
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    estado: params.estado,
    primer_nombre: params.primer_nombre,
    segundo_nombre: params.segundo_nombre,
    primer_apellido: params.primer_apellido,
    segundo_apellido: params.segundo_apellido,
  });

  const resp = await fetch(`${RUTA_CUIDADOR}?${qs}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  return handleResponse<Page<any>>(resp);
}

// ===== Función para actualizar cuidador =====
export async function updateCuidador(rut: string, payload: any) {
  const response = await fetch(`${RUTA_CUIDADOR}/${rut}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

// ===== Función para activar/desactivar cuidador =====
export async function toggleCuidadorStatus(rut: string, estado: boolean) {
  const response = await fetch(`${RUTA_CUIDADOR}/${rut}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ estado }),
  });
  return handleResponse(response);
}

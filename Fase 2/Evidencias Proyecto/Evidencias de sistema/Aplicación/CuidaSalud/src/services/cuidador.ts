// src/services/cuidador.ts
// Servicio de Cuidador: crear (registro)
// Compatible con schema CuidadorCreate del backend

const API_HOST = "http://127.0.0.1:8000";
const RUTA_CUIDADOR = `${API_HOST}/cuidador`;
const RUTA_CUIDADOR_HISTORIAL = `${API_HOST}/cuidador-historial`;

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
  seguro: string;
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
  
  try {
    // 1. Verificar si ya existe un cuidador con ese RUT
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
    const emailExists = await checkCuidadorByEmail(payload.email);
    if (emailExists) {
      return {
        ok: false,
        status: 409,
        message: "El correo electrónico ya está registrado en el sistema",
        details: null
      };
    }
    
    
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
    const successResult = {
      ok: true as const,
      data: result
    };

    return successResult;
    
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

// ===== Función para crear historial de cuidador =====
export async function createCuidadorHistorial(rutCuidador: string, cambio: string, resultado: boolean) {
  // El backend del historial requiere RUT SIN guión
  const rutSinGuion = rutCuidador.replace('-', '');
  
  const payload = {
    rut_cuidador: rutSinGuion,
    fecha_cambio: new Date().toISOString(),
    cambio: cambio,
    resultado: resultado
  };

  const response = await fetch(RUTA_CUIDADOR_HISTORIAL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en historial: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

// ===== Función para actualizar cuidador =====
export async function updateCuidador(rut: string, payload: any) {
  // 0. Obtener datos actuales del cuidador para comparar
  let datosOriginales: any = {};
  try {
    const responseActual = await fetch(`${RUTA_CUIDADOR}/${rut}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });
    
    if (responseActual.ok) {
      datosOriginales = await responseActual.json();
    }
  } catch (error) {
  }

  try {
    // 1. Actualizar el cuidador
    const response = await fetch(`${RUTA_CUIDADOR}/${rut}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const result = await handleResponse(response);
    
    // 2. Crear historial del cambio
    // Comparar valores originales con los nuevos para encontrar cambios reales
    const cambiosReales: { [key: string]: { anterior: any, nuevo: any } } = {};
    
    for (const [campo, nuevoValor] of Object.entries(payload)) {
      const valorAnterior = datosOriginales[campo];
      
      // Normalizar valores para comparación (convertir a string y manejar nulls/undefined)
      const valorAnteriorNormalizado = valorAnterior === null || valorAnterior === undefined ? '' : String(valorAnterior).trim();
      const valorNuevoNormalizado = nuevoValor === null || nuevoValor === undefined ? '' : String(nuevoValor).trim();
      
      // Solo considerar como cambio si los valores normalizados son realmente diferentes
      if (valorAnteriorNormalizado !== valorNuevoNormalizado) {
        cambiosReales[campo] = {
          anterior: valorAnteriorNormalizado || 'Sin valor',
          nuevo: valorNuevoNormalizado || 'Sin valor'
        };
      }
    }
    
    // Si no hay cambios reales, no crear historial
    if (Object.keys(cambiosReales).length === 0) {
      return result;
    }
    
    // Categorizar los campos que realmente cambiaron
    const camposModificados = Object.keys(cambiosReales);
    const tiposDeAcampos = {
      nombres: camposModificados.filter(campo => 
        campo.includes('primer_nombre') || campo.includes('segundo_nombre') || 
        campo.includes('primer_apellido') || campo.includes('segundo_apellido')
      ),
      contacto: camposModificados.filter(campo => 
        campo === 'telefono' || campo === 'direccion' || campo === 'email'
      ),
      emergencia: camposModificados.filter(campo => 
        campo.includes('nombre_contacto_emergencia') || campo.includes('telefono_contacto_emergencia')
      ),
      otros: camposModificados.filter(campo => 
        !campo.includes('nombre') && !campo.includes('apellido') && 
        campo !== 'telefono' && campo !== 'direccion' && campo !== 'email' &&
        !campo.includes('contacto_emergencia')
      )
    };
    
    // Generar descripción detallada con valores anteriores y nuevos
    let descripcion = '';
    const detallesCambios: string[] = [];
    
    // Procesar cada tipo de campo
    if (tiposDeAcampos.nombres.length > 0) {
      const cambiosNombres = tiposDeAcampos.nombres.map(campo => {
        const { anterior, nuevo } = cambiosReales[campo];
        const nombreCampo = campo.replace('_', ' ').replace('primer', 'Primer').replace('segundo', 'Segundo').replace('apellido', 'apellido');
        return `${nombreCampo}: "${anterior}" → "${nuevo}"`;
      });
      detallesCambios.push(`Nombres: ${cambiosNombres.join(', ')}`);
    }
    
    if (tiposDeAcampos.contacto.length > 0) {
      const cambiosContacto = tiposDeAcampos.contacto.map(campo => {
        const { anterior, nuevo } = cambiosReales[campo];
        const nombreCampo = campo === 'telefono' ? 'Teléfono' : campo === 'direccion' ? 'Dirección' : 'Email';
        return `${nombreCampo}: "${anterior}" → "${nuevo}"`;
      });
      detallesCambios.push(`Contacto: ${cambiosContacto.join(', ')}`);
    }
    
    if (tiposDeAcampos.emergencia.length > 0) {
      const cambiosEmergencia = tiposDeAcampos.emergencia.map(campo => {
        const { anterior, nuevo } = cambiosReales[campo];
        const nombreCampo = campo.includes('nombre') ? 'Nombre contacto emergencia' : 'Teléfono contacto emergencia';
        return `${nombreCampo}: "${anterior}" → "${nuevo}"`;
      });
      detallesCambios.push(`Emergencia: ${cambiosEmergencia.join(', ')}`);
    }
    
    if (tiposDeAcampos.otros.length > 0) {
      const cambiosOtros = tiposDeAcampos.otros.map(campo => {
        const { anterior, nuevo } = cambiosReales[campo];
        return `${campo}: "${anterior}" → "${nuevo}"`;
      });
      detallesCambios.push(`Otros: ${cambiosOtros.join(', ')}`);
    }
    
    descripcion = `Actualización: ${detallesCambios.join(' | ')}`;

    // Asegurar que no exceda 500 caracteres
    if (descripcion.length > 500) {
      descripcion = descripcion.substring(0, 497) + '...';
    }

    await createCuidadorHistorial(rut, descripcion, true);
    
    return result;
  } catch (error) {
    // Si falla la actualización, registrar el error en el historial
    try {
      const errorMsg = `Error al actualizar datos del cuidador`;
      await createCuidadorHistorial(rut, errorMsg, false);
    } catch (historialError) {
    }
    throw error;
  }
}

// ===== Función para activar/desactivar cuidador =====
export async function toggleCuidadorStatus(rut: string, estado: boolean) {
  // 1. Cambiar el estado del cuidador (esto es lo principal)
  const response = await fetch(`${RUTA_CUIDADOR}/${rut}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ estado }),
  });
  
  const result = await handleResponse(response);
  
  // 2. Crear historial del cambio de estado (no crítico)
  try {
    const accion = estado ? 'activado' : 'desactivado';
    await createCuidadorHistorial(rut, `Usuario ${accion}`, true);
  } catch (historialError) {
    // No lanzar error, la operación principal ya fue exitosa
  }
  
  return result;
}

// ===== Función para obtener historial de cuidadores =====
export async function getCuidadorHistorial(params?: { 
  page?: number; 
  page_size?: number; 
  rut_cuidador?: string; 
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.rut_cuidador) queryParams.append('rut_cuidador', params.rut_cuidador);
  
  const url = `${RUTA_CUIDADOR_HISTORIAL}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
  });
  
  return handleResponse(response);
}

// ===== Función para obtener total de cuidadores =====
export async function getTotalCuidadores() {
  const response = await fetch(`${RUTA_CUIDADOR}?page=1&page_size=1`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include",
  });
  
  const result = await handleResponse(response) as { total?: number };
  return result.total || 0;
}

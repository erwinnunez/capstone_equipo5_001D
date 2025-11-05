// src/services/pacienteCuidador.ts

const API_HOST = import.meta.env.VITE_API_HOST ?? "/api";

const RUTA_PACIENTE_CUIDADOR = `${API_HOST}/paciente-cuidador`;

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

export interface PacienteCuidadorCreate {
  rut_paciente: string;
  rut_cuidador: string;
  permiso_registro: boolean;
  permiso_lectura: boolean;
  fecha_inicio: string; // ISO datetime string
  fecha_fin: string; // ISO datetime string
  activo: boolean;
}

export interface PacienteCuidadorOut {
  rut_paciente: string;
  rut_cuidador: string;
  permiso_registro: boolean;
  permiso_lectura: boolean;
  fecha_inicio: string; // ISO datetime string
  fecha_fin: string; // ISO datetime string
  activo: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

/* =========================================================
   FUNCIONES
   ========================================================= */

/**
 * Crea una nueva relación paciente-cuidador
 */
export async function createPacienteCuidador(payload: PacienteCuidadorCreate): Promise<PacienteCuidadorOut> {
  const response = await fetch(RUTA_PACIENTE_CUIDADOR, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse<PacienteCuidadorOut>(response);
}

/**
 * Lista las relaciones paciente-cuidador
 */
export async function listPacienteCuidador(params?: {
  rut_paciente?: string;
  rut_cuidador?: string;
  activo?: boolean;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<PacienteCuidadorOut>> {
  // Construir los parámetros de query
  const searchParams = new URLSearchParams();
  
  if (params?.rut_paciente) searchParams.set("rut_paciente", params.rut_paciente);
  if (params?.rut_cuidador) searchParams.set("rut_cuidador", params.rut_cuidador);
  if (params?.activo !== undefined) searchParams.set("activo", String(params.activo));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));

  // Construir la URL completa
  const urlWithParams = `${RUTA_PACIENTE_CUIDADOR}?${searchParams.toString()}`;

  const response = await fetch(urlWithParams, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return handleResponse<PaginatedResponse<PacienteCuidadorOut>>(response);
}
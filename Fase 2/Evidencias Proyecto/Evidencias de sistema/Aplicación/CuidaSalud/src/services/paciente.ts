// src/services/paciente.ts

const API_HOST = "http://127.0.0.1:8000";

const RUTA_PACIENTE = `${API_HOST}/paciente`;
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

/* =========================================================
   ===============  REGISTRO DE PACIENTE  ==================
   ========================================================= */

// Tipado alineado con tu schema PacienteCreate
export type PacienteCreatePayload = {
  rut_paciente: number;
  id_comuna: number;

  primer_nombre_paciente: string;
  segundo_nombre_paciente: string;
  primer_apellido_paciente: string;
  segundo_apellido_paciente: string;

  fecha_nacimiento: string; // "YYYY-MM-DD"
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

// Resultado "no rompedor" para usar en el modal de registro
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

async function handleJson<T>(res: Response): Promise<ApiResult<T>> {
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    if (res.status === 422 && json?.detail) {
      return { ok: false, status: 422, message: toNiceMessage(json), details: json };
    }
    let msg = `HTTP ${res.status}`;
    if (json?.detail) msg = typeof json.detail === "string" ? json.detail : JSON.stringify(json.detail);
    return { ok: false, status: res.status, message: msg, details: json ?? text };
  }
  return { ok: true, data: (json ?? ({} as T)) as T };
}

// Crear Paciente (pensado para el botón "Crear cuenta")
export async function createPaciente(payload: PacienteCreatePayload): Promise<ApiResult<any>> {
  const res = await fetch(RUTA_PACIENTE, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson<any>(res);
}

/* =========================================================
   ===============         PACIENTES          ==============
   ========================================================= */

export async function getPacientes<T>(): Promise<T> {
  const resp = await fetch(RUTA_PACIENTE, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  return handleResponse(resp);
}

export async function getPacienteByRut<T>(rut_paciente: number): Promise<T> {
  const resp = await fetch(`${RUTA_PACIENTE}/${rut_paciente}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  return handleResponse(resp);
}

/* =========================================================
   ===============       MEDICIONES           ==============
   ========================================================= */

export type Severidad = "normal" | "warning" | "critical";

export interface MedicionCreatePayload {
  rut_paciente: number;
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
  rut_paciente?: number;
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
  });
  return handleResponse<Page<MedicionDetalleOut>>(resp);
}

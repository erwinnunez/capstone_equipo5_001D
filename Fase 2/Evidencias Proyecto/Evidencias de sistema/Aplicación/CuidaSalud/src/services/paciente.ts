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

// ---------- Pacientes (como tu ejemplo) ----------
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

// ---------- Tipos para mediciones ----------
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

// ---------- Endpoints mediciones ----------
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

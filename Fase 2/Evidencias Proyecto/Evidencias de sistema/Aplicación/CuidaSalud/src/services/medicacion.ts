// src/services/medicacion.ts
const API_HOST = "http://127.0.0.1:8000";

const RUTA_MEDICINA = `${API_HOST}/medicina`;
const RUTA_MEDICINA_DETALLE = `${API_HOST}/medicina-detalle`;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "error en la solicitud";
    try {
      const err = await response.json();
      message = typeof err === "string" ? err : err?.detail ?? message;
    } catch {}
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export interface MedicinaOut {
  id_medicina: number;
  id_unidad: number;
  nombre: string;
  instrucciones?: string | null;
  toma_maxima?: string | null;
  efectos?: string | null;
}

export interface MedicinaDetalleOut {
  id_detalle: number;
  id_medicina: number;
  rut_paciente: number;
  dosis?: string | null;
  instrucciones_toma?: string | null;
  fecha_inicio?: string | null;   // ISO
  fecha_fin?: string | null;      // ISO
  tomada: boolean;
  fecha_tomada?: string | null;   // ISO  ← NUEVO
}

// ---- GET /medicina/{id}
export async function getMedicina(id_medicina: number): Promise<MedicinaOut> {
  const resp = await fetch(`${RUTA_MEDICINA}/${id_medicina}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  return handleResponse<MedicinaOut>(resp);
}

// ---- GET /medicina-detalle
export async function listMedicinaDetalles(params: {
  rut_paciente?: number;
  id_medicina?: number;
  desde?: string; // ISO
  hasta?: string; // ISO
  tomada?: boolean;
  page?: number;
  page_size?: number;
}): Promise<Page<MedicinaDetalleOut>> {
  const q = new URLSearchParams();
  if (params.rut_paciente != null) q.set("rut_paciente", String(params.rut_paciente));
  if (params.id_medicina != null) q.set("id_medicina", String(params.id_medicina));
  if (params.desde) q.set("desde", params.desde);
  if (params.hasta) q.set("hasta", params.hasta);
  if (params.tomada != null) q.set("tomada", String(params.tomada));
  q.set("page", String(params.page ?? 1));
  q.set("page_size", String(params.page_size ?? 50));

  const resp = await fetch(`${RUTA_MEDICINA_DETALLE}?${q.toString()}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  return handleResponse<Page<MedicinaDetalleOut>>(resp);
}

/**
 * PATCH /medicina-detalle/{id}
 * Marca tomada/no tomada y, opcionalmente, registra la fecha/hora de toma.
 * - Si `tomada === true` y no envías `fecha_tomada`, el backend puede setear "ahora".
 * - Si `tomada === false`, puedes enviar `fecha_tomada: null` para limpiar (si tu API lo soporta).
 */
export async function patchMedicinaDetalleTomada(
  id_detalle: number,
  tomada: boolean,
  fecha_tomada?: string | null
): Promise<MedicinaDetalleOut> {
  const body: Record<string, any> = { tomada };
  if (fecha_tomada !== undefined) body.fecha_tomada = fecha_tomada;

  const resp = await fetch(`${RUTA_MEDICINA_DETALLE}/${id_detalle}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<MedicinaDetalleOut>(resp);
}

/** Azúcar sintáctica: marca como tomada con timestamp "ahora" (ISO). */
export async function markMedicinaTomadaAhora(id_detalle: number) {
  const nowIso = new Date().toISOString();
  return patchMedicinaDetalleTomada(id_detalle, true, nowIso);
}

/** Azúcar sintáctica: desmarca como tomada y limpia fecha_tomada (si la API lo permite). */
export async function markMedicinaNoTomada(id_detalle: number) {
  return patchMedicinaDetalleTomada(id_detalle, false, null);
}

// Service: rango-paciente
const API_HOST = "http://127.0.0.1:8000";
const RUTA_RANGO_PACIENTE = `${API_HOST}/rango-paciente`;

// ---------- Helper de respuesta ----------
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

// ---------- Helper de query ----------
function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  return q.toString();
}

// ---------- Tipos ----------
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export interface RangoPacienteCreate {
  rut_paciente: number;
  id_parametro: number;
  min_normal: number | null;
  max_normal: number | null;
  min_critico: number | null;
  max_critico: number | null;
  vigencia_desde?: string | null; // ISO
  vigencia_hasta?: string | null; // ISO
  version?: number | null;
  definido_por?: boolean | null;
}

export interface RangoPacienteOut extends RangoPacienteCreate {
  id_rango: number;
}

export interface RangoPacienteUpdate {
  min_normal?: number | null;
  max_normal?: number | null;
  min_critico?: number | null;
  max_critico?: number | null;
  vigencia_desde?: string | null;
  vigencia_hasta?: string | null;
  version?: number | null;
  definido_por?: boolean | null;
}

// ---------- Endpoints ----------
export async function listRangosPaciente(params: {
  page?: number;
  page_size?: number;
  rut_paciente?: number;
  id_parametro?: number;
}): Promise<Page<RangoPacienteOut>> {
  const qs = buildQuery({
    page: params.page ?? 1,
    page_size: params.page_size ?? 100,
    rut_paciente: params.rut_paciente,
    id_parametro: params.id_parametro,
  });
  const resp = await fetch(`${RUTA_RANGO_PACIENTE}?${qs}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  return handleResponse<Page<RangoPacienteOut>>(resp);
}

export async function getRangoPaciente(id_rango: number): Promise<RangoPacienteOut> {
  const resp = await fetch(`${RUTA_RANGO_PACIENTE}/${id_rango}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  return handleResponse<RangoPacienteOut>(resp);
}

export async function createRangoPaciente(payload: RangoPacienteCreate): Promise<RangoPacienteOut> {
  const resp = await fetch(RUTA_RANGO_PACIENTE, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<RangoPacienteOut>(resp);
}

export async function updateRangoPaciente(
  id_rango: number,
  payload: RangoPacienteUpdate
): Promise<RangoPacienteOut> {
  const resp = await fetch(`${RUTA_RANGO_PACIENTE}/${id_rango}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<RangoPacienteOut>(resp);
}

export async function deleteRangoPaciente(id_rango: number): Promise<{ message: string }> {
  const resp = await fetch(`${RUTA_RANGO_PACIENTE}/${id_rango}`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
  });
  return handleResponse<{ message: string }>(resp);
}

// ---------- Helpers ----------
/** Devuelve un índice por id_parametro con el rango más reciente (primer item) */
export async function getRangosIndexByParametro(
  rut_paciente: number
): Promise<Record<number, RangoPacienteOut>> {
  const page = await listRangosPaciente({ rut_paciente, page_size: 500 });
  const idx: Record<number, RangoPacienteOut> = {};
  for (const r of page.items ?? []) {
    // como vienen ordenados por id_rango desc en tu API, el primero que veamos será el más nuevo
    if (!idx[r.id_parametro]) idx[r.id_parametro] = r;
  }
  return idx;
}

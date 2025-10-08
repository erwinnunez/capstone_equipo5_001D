// src/services/parametroClinico.ts

const API_HOST = "http://127.0.0.1:8000";
const RUTA_PARAMETRO_CLINICO = `${API_HOST}/parametro-clinico`;

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

export interface ParametroClinicoOut {
  id_parametro: number;
  id_unidad: number;
  codigo: string;
  descipcion?: string;             // (tal como lo expone tu API)
  rango_ref_min?: number | null;
  rango_ref_max?: number | null;
}

export interface ParametroClinicoCreate {
  id_unidad: number;
  codigo: string;
  descipcion?: string;
  rango_ref_min?: number | null;
  rango_ref_max?: number | null;
}

export interface ParametroClinicoUpdate {
  id_unidad?: number;
  codigo?: string;
  descipcion?: string;
  rango_ref_min?: number | null;
  rango_ref_max?: number | null;
}

// ---------- Endpoints ----------
export async function listParametrosClinicos(params?: {
  page?: number;
  page_size?: number;
  id_unidad?: number;
  codigo?: string;
}): Promise<Page<ParametroClinicoOut>> {
  const qs = buildQuery({
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 50,
    id_unidad: params?.id_unidad,
    codigo: params?.codigo,
  });

  const resp = await fetch(`${RUTA_PARAMETRO_CLINICO}?${qs}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  return handleResponse<Page<ParametroClinicoOut>>(resp);
}

export async function getParametroClinico(id_parametro: number): Promise<ParametroClinicoOut> {
  const resp = await fetch(`${RUTA_PARAMETRO_CLINICO}/${id_parametro}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  return handleResponse<ParametroClinicoOut>(resp);
}

export async function createParametroClinico(
  payload: ParametroClinicoCreate
): Promise<ParametroClinicoOut> {
  const resp = await fetch(RUTA_PARAMETRO_CLINICO, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<ParametroClinicoOut>(resp);
}

export async function updateParametroClinico(
  id_parametro: number,
  payload: ParametroClinicoUpdate
): Promise<ParametroClinicoOut> {
  const resp = await fetch(`${RUTA_PARAMETRO_CLINICO}/${id_parametro}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<ParametroClinicoOut>(resp);
}

export async function deleteParametroClinico(
  id_parametro: number
): Promise<{ message: string }> {
  const resp = await fetch(`${RUTA_PARAMETRO_CLINICO}/${id_parametro}`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
  });
  return handleResponse<{ message: string }>(resp);
}

// ---------- Helpers opcionales útiles ----------
/** Diccionario por CÓDIGO (uppercased) → ParametroClinicoOut */
export async function getParametrosMapByCodigo(): Promise<Record<string, ParametroClinicoOut>> {
  const page = await listParametrosClinicos({ page_size: 200 });
  const map: Record<string, ParametroClinicoOut> = {};
  for (const it of page.items ?? []) {
    if (it?.codigo) map[it.codigo.toUpperCase()] = it;
  }
  return map;
}

/** Obtiene por código exacto (case-insensitive) usando el filtro del backend */
export async function findParametroByCodigo(codigo: string): Promise<ParametroClinicoOut | undefined> {
  const res = await listParametrosClinicos({ page_size: 1, codigo });
  return res.items?.[0];
}

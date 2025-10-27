// src/services/medicion.ts
const API_HOST = import.meta.env.VITE_API_HOST ?? "http://127.0.0.1:8000";
const RUTA_MEDICION = `${API_HOST}/medicion`;
const RUTA_ALERTAS = `${RUTA_MEDICION}/alertas`;
const RUTA_MEDICION_DETALLE = `${API_HOST}/medicion-detalle`;

export type EstadoAlerta = "nueva" | "en_proceso" | "resuelta" | "ignorada";

export type MedicionOut = {
  id_medicion: number;
  rut_paciente: number;
  fecha_registro: string;
  origen: string;
  registrado_por: string;
  observacion: string;
  evaluada_en: string;
  tiene_alerta: boolean;
  severidad_max: string;
  resumen_alerta: string;
  estado_alerta: EstadoAlerta;
  tomada_por: number | null;
  tomada_en: string | null;
};

export type MedicionDetalleOut = {
  id_detalle: number;
  id_medicion: number;
  id_parametro: number;
  id_unidad: number;
  valor_num: number | null;
  valor_texto: string | null;
  fuera_rango: boolean;
  severidad: string;
  umbral_min: number | null;
  umbral_max: number | null;
  tipo_alerta: string;
};

export type Page<T> = { items: T[]; total: number; page: number; page_size: number };

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

async function handleJson<T>(res: Response): Promise<ApiResult<T>> {
  // Soporte 204/205 sin cuerpo
  if (res.status === 204 || res.status === 205) {
    return { ok: true, data: {} as T };
  }
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }

  if (!res.ok) {
    if (res.status === 422 && json?.detail) {
      const msg = toNiceMessage(json);
      return { ok: false, status: 422, message: msg, details: json };
    }
    let msg = `HTTP ${res.status}`;
    if (json?.detail) msg = typeof json.detail === "string" ? json.detail : JSON.stringify(json.detail);
    return { ok: false, status: res.status, message: msg, details: json ?? text };
  }

  return { ok: true, data: (json ?? ({} as T)) as T };
}

/** NUEVO: obtener una medición por id */
export async function getMedicionById(id_medicion: number): Promise<ApiResult<MedicionOut>> {
  const res = await fetch(`${RUTA_MEDICION}/${id_medicion}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    credentials: "include",
  });
  return handleJson<MedicionOut>(res);
}

/** Lista SOLO mediciones con alerta = true usando /medicion/alertas */
export async function listarMedicionesConAlerta(
  page = 1,
  page_size = 50,
  params?: { rut_paciente?: number; desde?: string; hasta?: string; estado_alerta?: EstadoAlerta }
): Promise<ApiResult<Page<MedicionOut>>> {
  const url = new URL(RUTA_ALERTAS);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(page_size));
  if (params?.rut_paciente != null) url.searchParams.set("rut_paciente", String(params.rut_paciente));
  if (params?.desde) url.searchParams.set("desde", params.desde);
  if (params?.hasta) url.searchParams.set("hasta", params.hasta);
  if (params?.estado_alerta) url.searchParams.set("estado_alerta", params.estado_alerta);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "content-type": "application/json" },
    credentials: "include",
  });
  return handleJson<Page<MedicionOut>>(res);
}

export async function listarMediciones(
  page = 1,
  page_size = 50,
  tiene_alerta?: boolean
): Promise<ApiResult<Page<MedicionOut>>> {
  const url = new URL(RUTA_MEDICION);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(page_size));
  if (typeof tiene_alerta === "boolean") url.searchParams.set("tiene_alerta", String(tiene_alerta));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "content-type": "application/json" },
    credentials: "include",
  });
  return handleJson<Page<MedicionOut>>(res);
}

/** Detalles */
export async function listMedicionDetalles(params: {
  id_medicion?: number;
  id_parametro?: number;
  page?: number;
  page_size?: number;
}): Promise<ApiResult<Page<MedicionDetalleOut>>> {
  const url = new URL(RUTA_MEDICION_DETALLE);
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("page_size", String(params.page_size ?? 50));
  if (params.id_medicion != null) url.searchParams.set("id_medicion", String(params.id_medicion));
  if (params.id_parametro != null) url.searchParams.set("id_parametro", String(params.id_parametro));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "content-type": "application/json" },
    credentials: "include",
  });
  return handleJson<Page<MedicionDetalleOut>>(res);
}

/** PATCH estado de una medición */
export type MedicionEstadoIn = {
  estado_alerta: EstadoAlerta;
  tomada_por?: number | null;
  tomada_en?: string | null;
};

export async function patchEstadoMedicion(
  id_medicion: number,
  body: MedicionEstadoIn
): Promise<ApiResult<MedicionOut>> {
  const res = await fetch(`${RUTA_MEDICION}/${id_medicion}/estado`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleJson<MedicionOut>(res);
}

/** Helpers de acción */
export async function tomarMedicion(id_medicion: number, rut_medico: number) {
  return patchEstadoMedicion(id_medicion, {
    estado_alerta: "en_proceso",
    tomada_por: rut_medico,
    tomada_en: new Date().toISOString(),
  });
}
export async function resolverMedicion(id_medicion: number) {
  return patchEstadoMedicion(id_medicion, { estado_alerta: "resuelta" });
}
export async function ignorarMedicion(id_medicion: number) {
  return patchEstadoMedicion(id_medicion, { estado_alerta: "ignorada" });
}

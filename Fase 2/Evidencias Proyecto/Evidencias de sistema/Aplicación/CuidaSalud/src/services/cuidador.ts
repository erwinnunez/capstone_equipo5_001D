// Servicio de Cuidador: crear (registro)
// Compatible con schema CuidadorCreate del backend

const API_HOST = "http://127.0.0.1:8000";
const RUTA_CUIDADOR = `${API_HOST}/cuidador`;

export type CuidadorCreatePayload = {
  rut_cuidador: number;
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

export async function createCuidador(payload: CuidadorCreatePayload): Promise<ApiResult<any>> {
  const res = await fetch(RUTA_CUIDADOR, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson<any>(res);
}

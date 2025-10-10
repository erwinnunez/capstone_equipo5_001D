// src/services/equipoMedico.ts
// Servicio para crear médicos (incluye is_admin)

const API_HOST = "http://127.0.0.1:8000";
const RUTA_EQUIPO_MEDICO = `${API_HOST}/equipo-medico`;

export type EquipoMedicoCreatePayload = {
  rut_medico: number; // 9 dígitos, sin puntos/guion
  id_cesfam: number;
  primer_nombre_medico: string;
  segundo_nombre_medico?: string | null; // null si vacío
  primer_apellido_medico: string;
  segundo_apellido_medico: string;
  email: string;
  contrasenia: string; // mínimo 8, con Aa1
  telefono: number; // 9 dígitos
  direccion: string;
  rol: string; // "medico"
  especialidad: string;
  estado: boolean;
  is_admin?: boolean;
};

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
  let json: any;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

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

/**
 * Crea un médico. Para administrador, pasa is_admin=true.
 */
export async function createMedico(
  payload: EquipoMedicoCreatePayload,
  token?: string // si usas JWT
): Promise<ApiResult<any>> {
  const res = await fetch(RUTA_EQUIPO_MEDICO, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleJson<any>(res);
}

// src/services/auth.ts
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

export type Role = "admin" | "doctor" | "caregiver" | "patient";

export interface FrontUser {
  id: string;
  name: string;
  role: Role;
  email: string;
  rut_paciente?: string;
}

export interface LoginResponse {
  user: FrontUser;
  token?: string | null;
}

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function normalizeEmail(email: string) {
  return (email ?? "").trim().toLowerCase();
}

async function readJson(res: Response) {
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { json, text };
}

function toError(res: Response, json: any, fallback?: string) {
  const d = json?.detail ?? json?.message ?? json?.error;
  const msg = typeof d === "string" ? d : (fallback ?? `HTTP ${res.status} ${res.statusText}`);
  return new ApiError(msg, res.status, json);
}

function abortableFetch(url: string, init?: RequestInit, ms = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...init, signal: ctrl.signal })
    .finally(() => clearTimeout(id));
}

/** Login -> POST /auth/login  { email, password, role }  => { user, token? } */
export async function login(email: string, password: string, role: Role): Promise<LoginResponse> {
  const payload = { email: normalizeEmail(email), password, role };
  try {
    const res = await abortableFetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const { json, text } = await readJson(res);
    if (!res.ok) {
      // mapea 401 a un mensaje claro
      if (res.status === 401 && (json?.detail || json?.message)) {
        throw toError(res, json, "Credenciales inválidas");
      }
      throw toError(res, json, text || "No se pudo iniciar sesión");
    }
    // Tu backend ya retorna { user, token? }
    return (json ?? {}) as LoginResponse;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new ApiError("Tiempo de espera agotado comunicando con el servidor.", 0);
    }
    if (e instanceof ApiError) throw e;
    throw new ApiError(e?.message ?? "Fallo de red", 0);
  }
}

/** (Opcional) Traer perfil real si mañana habilitas JWT y /users/me o /auth/me */
export async function getMe(token: string): Promise<FrontUser> {
  const res = await abortableFetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { json, text } = await readJson(res);
  if (!res.ok) throw toError(res, json, text || "No se pudo cargar el perfil");
  // adapta si tu endpoint usa otras claves
  const j = json || {};
  return {
    id: String(j.id ?? j.sub ?? "me"),
    name: String(j.name ?? j.full_name ?? j.email ?? "Usuario"),
    role: (j.role ?? "patient") as Role,
    email: String(j.email ?? "unknown@example.com"),
    rut_paciente: j.rut_paciente,
  };
}

/** (Opcional) envoltorio para peticiones autenticadas */
export async function withAuth<T = any>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await abortableFetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  const { json, text } = await readJson(res);
  if (!res.ok) throw toError(res, json, text || "Error en la solicitud");
  return (json ?? {}) as T;
}

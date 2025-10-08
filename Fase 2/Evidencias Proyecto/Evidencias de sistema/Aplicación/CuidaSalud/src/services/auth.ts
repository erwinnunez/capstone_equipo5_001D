// src/services/auth.ts
const API_BASE = "http://127.0.0.1:8000";

const RUTA = {
  paciente: `${API_BASE}/paciente`,
  medico: `${API_BASE}/equipo-medico`,
  cuidador: `${API_BASE}/cuidador`,
  auth_login: `${API_BASE}/auth/login`, // opcional si algún día lo expones
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error?.detail || error || "error en la solicitud");
    } catch {
      throw new Error("error en la solicitud");
    }
  }
  return response.json();
}

function buildQuery(params: Record<string, unknown>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/* ===== Tipos mínimos ===== */
export interface PacienteOut {
  rut_paciente: number;
  primer_nombre_paciente: string;
  segundo_nombre_paciente?: string | null;
  primer_apellido_paciente: string;
  segundo_apellido_paciente?: string | null;
  email: string;
  contrasena: string;
  estado: boolean;
}

export interface EquipoMedicoOut {
  rut_medico: number;
  primer_nombre_medico: string;
  segundo_nombre_medico?: string | null;
  primer_apellido_medico: string;
  segundo_apellido_medico?: string | null;
  email: string;
  contrasenia: string;
  estado: boolean;
}

export interface CuidadorOut {
  rut_cuidador: number;
  primer_nombre_cuidador: string;
  segundo_nombre_cuidador?: string | null;
  primer_apellido_cuidador: string;
  segundo_apellido_cuidador?: string | null;
  email: string;
  contrasena: string;
  estado: boolean;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export type Role = "admin" | "doctor" | "caregiver" | "patient";

export interface FrontUser {
  id: string;
  name: string;
  role: Role;
  email: string;
  rut_paciente?: number;
  token?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  role: Role;
}

export interface LoginResponse {
  user: FrontUser;
  token?: string;
}

/* ===== Helpers nombres ===== */
function nombrePaciente(p: PacienteOut) {
  const sn = p.segundo_nombre_paciente ? ` ${p.segundo_nombre_paciente}` : "";
  const sa = p.segundo_apellido_paciente ? ` ${p.segundo_apellido_paciente}` : "";
  return `${p.primer_nombre_paciente}${sn} ${p.primer_apellido_paciente}${sa}`.trim();
}
function nombreMedico(m: EquipoMedicoOut) {
  const sn = m.segundo_nombre_medico ? ` ${m.segundo_nombre_medico}` : "";
  const sa = m.segundo_apellido_medico ? ` ${m.segundo_apellido_medico}` : "";
  return `${m.primer_nombre_medico}${sn} ${m.primer_apellido_medico}${sa}`.trim();
}
function nombreCuidador(c: CuidadorOut) {
  const sn = c.segundo_nombre_cuidador ? ` ${c.segundo_nombre_cuidador}` : "";
  const sa = c.segundo_apellido_cuidador ? ` ${c.segundo_apellido_cuidador}` : "";
  return `${c.primer_nombre_cuidador}${sn} ${c.primer_apellido_cuidador}${sa}`.trim();
}

/* ===== List genéricos con QS bien formada ===== */
async function listPacientes(params: { page: number; page_size: number; estado?: boolean }) {
  const qs = buildQuery(params);
  const resp = await fetch(`${RUTA.paciente}${qs}`, { headers: { "content-type": "application/json" } });
  return handleResponse<PageResponse<PacienteOut>>(resp);
}
async function listMedicos(params: { page: number; page_size: number; estado?: boolean }) {
  const qs = buildQuery(params);
  const resp = await fetch(`${RUTA.medico}${qs}`, { headers: { "content-type": "application/json" } });
  return handleResponse<PageResponse<EquipoMedicoOut>>(resp);
}
async function listCuidadores(params: { page: number; page_size: number; estado?: boolean }) {
  const qs = buildQuery(params);
  const resp = await fetch(`${RUTA.cuidador}${qs}`, { headers: { "content-type": "application/json" } });
  return handleResponse<PageResponse<CuidadorOut>>(resp);
}

/* ===== Paginado hasta encontrar coincidencia ===== */
async function fetchPagedUntilMatch<T>(
  fetchPage: (page: number) => Promise<PageResponse<T>>,
  predicate: (row: T) => boolean,
  pageSize = 200,
  maxPages = 20
): Promise<T | undefined> {
  let page = 1;
  while (page <= maxPages) {
    const res = await fetchPage(page);
    const hit = (res.items || []).find(predicate);
    if (hit) return hit;
    const seen = res.page * res.page_size;
    if (seen >= res.total) break;
    page++;
  }
  return undefined;
}

/* ===== Logins por rol (fallback por tabla) ===== */
export async function loginPatient(email: string, password: string): Promise<FrontUser> {
  // Fallback vía /paciente (estado=True por defecto en tu API; igual lo paso explícito)
  const match = await fetchPagedUntilMatch<PacienteOut>(
    (page) => listPacientes({ page, page_size: 200, estado: true }),
    (p) => p.estado && p.email?.toLowerCase() === email.toLowerCase() && p.contrasena === password
  );
  if (!match) throw new Error("Credenciales inválidas o paciente inactivo");

  return {
    id: String(match.rut_paciente),
    name: nombrePaciente(match),
    role: "patient",
    email: match.email,
    rut_paciente: match.rut_paciente,
  };
}

export async function loginDoctor(email: string, password: string): Promise<FrontUser> {
  const match = await fetchPagedUntilMatch<EquipoMedicoOut>(
    (page) => listMedicos({ page, page_size: 200, estado: true }),
    (m) => m.estado && m.email?.toLowerCase() === email.toLowerCase() && m.contrasenia === password
  );
  if (!match) throw new Error("Credenciales inválidas o médico inactivo");

  return {
    id: String(match.rut_medico),
    name: nombreMedico(match),
    role: "doctor",
    email: match.email,
  };
}

export async function loginCaregiver(email: string, password: string): Promise<FrontUser> {
  const match = await fetchPagedUntilMatch<CuidadorOut>(
    (page) => listCuidadores({ page, page_size: 200, estado: true }),
    (c) => c.estado && c.email?.toLowerCase() === email.toLowerCase() && c.contrasena === password
  );
  if (!match) throw new Error("Credenciales inválidas o cuidador inactivo");

  return {
    id: String(match.rut_cuidador),
    name: nombreCuidador(match),
    role: "caregiver",
    email: match.email,
  };
}

/* ===== Entrada unificada ===== */
export async function login(email: string, password: string, role: Role): Promise<FrontUser> {
  if (role === "patient")  return loginPatient(email, password);
  if (role === "doctor")   return loginDoctor(email, password);
  if (role === "caregiver")return loginCaregiver(email, password);
  // Admin: como no hay tabla/admin, solo demo
  return Promise.reject(new Error('Rol "admin" aún no implementado'));
}

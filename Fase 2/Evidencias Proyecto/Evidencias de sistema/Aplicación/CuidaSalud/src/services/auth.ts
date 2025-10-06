// src/services/auth.ts
const API_BASE = "http://127.0.0.1:8000";
const ruta_paciente = `${API_BASE}/paciente`;
const ruta_auth_login = `${API_BASE}/auth/login`; // si después agregas un endpoint real

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // intenta parsear JSON de error, si no, tira un mensaje simple
    try {
      const error = await response.json();
      throw new Error(error?.detail || error || "error en la solicitud");
    } catch {
      throw new Error("error en la solicitud");
    }
  }
  return await response.json();
}

/** Tipos mínimos para trabajar con la respuesta de /paciente */
export interface PacienteOut {
  rut_paciente: number;
  id_comuna: number;
  primer_nombre_paciente: string;
  segundo_nombre_paciente: string;
  primer_apellido_paciente: string;
  segundo_apellido_paciente: string;
  fecha_nacimiento: string; // ISO
  sexo: boolean;
  tipo_de_sangre: string;
  enfermedades: string;
  seguro: string;
  direccion: string;
  telefono: number;
  email: string;
  contrasena: string;
  tipo_paciente: string;
  nombre_contacto: string;
  telefono_contacto: number;
  estado: boolean;
  id_cesfam: number;
  fecha_inicio_cesfam: string;
  fecha_fin_cesfam?: string | null;
  activo_cesfam: boolean;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

/** Usuario que usará tu front */
export interface FrontUser {
  id: string; // usamos el rut como string
  name: string;
  role: "admin" | "doctor" | "caregiver" | "patient";
  email: string;
  rut_paciente?: number;
  token?: string; // por si luego el backend te devuelve un JWT
}

/** Payload de login */
export interface LoginPayload {
  email: string;
  password: string;
  role: "patient" | "doctor" | "caregiver" | "admin";
}

/** Respuesta esperada si tuvieras un /auth/login real */
export interface LoginResponse {
  user: FrontUser;
  token?: string;
}

/** Construye el nombre completo del paciente */
function nombrePaciente(p: PacienteOut) {
  const segNom = p.segundo_nombre_paciente ? ` ${p.segundo_nombre_paciente}` : "";
  const segApe = p.segundo_apellido_paciente ? ` ${p.segundo_apellido_paciente}` : "";
  return `${p.primer_nombre_paciente}${segNom} ${p.primer_apellido_paciente}${segApe}`.trim();
}

/**
 * Login para PACIENTE:
 * 1) Intenta POST /auth/login (si existe).
 * 2) Fallback: GET /paciente y filtra por email + contrasena en el front (para pruebas).
 */
export async function loginPatient(
  email: string,
  password: string
): Promise<FrontUser> {
  // 1) Intento de login real (si más adelante agregas auth)
  try {
    const resp = await fetch(ruta_auth_login, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, role: "patient" } as LoginPayload),
    });

    if (resp.ok) {
      const data = await handleResponse<LoginResponse>(resp);
      // normaliza por si el backend devuelve otras keys
      return {
        id: data.user.id,
        name: data.user.name,
        role: "patient",
        email: data.user.email,
        rut_paciente: data.user.rut_paciente,
        token: data.token,
      };
    }
    // si NO ok, cae al fallback
  } catch {
    // si no existe endpoint /auth/login o falla la red, seguimos al fallback
  }

  // 2) Fallback funcional hoy: trae pacientes y busca coincidencia
  const listResp = await fetch(`${ruta_paciente}?page=1&page_size=1000`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  const page = await handleResponse<PageResponse<PacienteOut>>(listResp);

  const match = page.items.find(
    (p) =>
      p.email?.toLowerCase() === email.toLowerCase() &&
      p.contrasena === password && // OJO: solo para pruebas locales
      p.estado === true
  );

  if (!match) {
    throw new Error("Credenciales inválidas o paciente inactivo");
  }

  return {
    id: String(match.rut_paciente),
    name: nombrePaciente(match),
    role: "patient",
    email: match.email,
    rut_paciente: match.rut_paciente,
  };
}

/**
 * Punto de entrada general de login para tu LoginPage.
 * Por ahora, implementado solo para 'patient' (lo que pediste).
 * Puedes extender con loginDoctor/loginCaregiver/loginAdmin cuando tengas endpoints.
 */
export async function login(
  email: string,
  password: string,
  role: "admin" | "doctor" | "caregiver" | "patient"
): Promise<FrontUser> {
  if (role === "patient") {
    return loginPatient(email, password);
  }
  // Si necesitas otros roles, añade sus funciones aquí:
  // if (role === "doctor") return loginDoctor(email, password);
  // if (role === "caregiver") return loginCaregiver(email, password);
  // if (role === "admin") return loginAdmin(email, password);
  throw new Error(`Login para el rol "${role}" aún no implementado`);
}

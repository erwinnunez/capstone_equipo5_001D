// src/services/soapNote.ts
// Servicio para guardar nota clínica siguiendo el patrón del resto de servicios

const API_HOST = import.meta.env.VITE_API_HOST ?? "http://127.0.0.1:8000";
const RUTA_NOTA_CLINICA = `${API_HOST}/nota-clinica`;

export type NotaClinicaCreatePayload = {
  rut_paciente: string;
  rut_medico: string;
  tipo_autor: string;
  nota: string;
  tipo_nota: string;
  creada_en: string;
};

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

export async function createNotaClinica(payload: NotaClinicaCreatePayload): Promise<any> {
  const res = await fetch(RUTA_NOTA_CLINICA, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<any>(res);
}

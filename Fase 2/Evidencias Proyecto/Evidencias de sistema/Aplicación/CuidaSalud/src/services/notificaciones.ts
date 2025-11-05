const API_HOST = "http://127.0.0.1:8000";
const RUTA_NOTIFICACIONES = `${API_HOST}/notificaciones`;

async function handleResponse<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(error || "Error en la solicitud");
  }
  return resp.json();
}

export interface NotificacionOut {
  id_notificacion: number;
  rut_paciente: number;
  rut_cuidador?: number | null;
  tipo: string;
  severidad: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creada_en: string;
}

// Listar notificaciones (puede ser por cuidador o generales)
export async function listNotificaciones(
  rut_cuidador: number,
  page = 1,
  limit = 5
): Promise<{ items: NotificacionOut[]; total: number }> {
  const url = `${RUTA_NOTIFICACIONES}/cuidador/${rut_cuidador}?page=${page}&limit=${limit}`;
  const resp = await fetch(url);
  return handleResponse<{ items: NotificacionOut[]; total: number }>(resp);
}

// Marcar una notificación como leída
export async function marcarLeida(id_notificacion: number): Promise<NotificacionOut> {
  const resp = await fetch(`${RUTA_NOTIFICACIONES}/${id_notificacion}/leer`, {
    method: "PATCH",
  });
  return handleResponse<NotificacionOut>(resp);
}


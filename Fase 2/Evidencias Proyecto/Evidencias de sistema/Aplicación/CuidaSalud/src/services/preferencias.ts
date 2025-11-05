const API_HOST = import.meta.env.VITE_API_HOST ?? "http://127.0.0.1:8000";
const RUTA_PREFERENCIAS = `${API_HOST}/preferencias`;

export interface PreferenciaNotificacion {
  rut_cuidador: number;
  recibir_criticas: boolean;
  recibir_moderadas: boolean;
  recibir_leves: boolean;
  canal_app: boolean;
  canal_email: boolean;
}

export async function getPreferencias(rut_cuidador: number): Promise<PreferenciaNotificacion> {
  const resp = await fetch(`${RUTA_PREFERENCIAS}/${rut_cuidador}`);
  if (!resp.ok) throw new Error("No se pudo obtener las preferencias");
  return resp.json();
}

export async function updatePreferencias(rut_cuidador: number, data: Omit<PreferenciaNotificacion, "rut_cuidador">) {
  const resp = await fetch(`${RUTA_PREFERENCIAS}/${rut_cuidador}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error("No se pudo actualizar las preferencias");
  return resp.json();
}

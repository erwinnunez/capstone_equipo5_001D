// Respuesta paginada de reportes
export type SolicitudReportePage = {
  items: Array<{
    id_reporte: number;
    rut_medico: string;
    rango_desde: string;
    rango_hasta: string;
    tipo: string;
    formato: string;
    estado: string;
    creado_en: string;
  }>;
  total: number;
  page: number;
  page_size: number;
};

// Listar reportes recientes por rut_medico
export async function listSolicitudReportes({ rut_medico, page = 1, page_size = 20 }: { rut_medico: string; page?: number; page_size?: number; }): Promise<SolicitudReportePage> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(page_size),
    rut_medico,
  });
  const resp = await fetch(`${RUTA_SOLICITUD_REPORTE}?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.detail || 'Error al listar reportes');
  }
  return resp.json();
}
// src/services/solicitudReporte.ts

const API_HOST = import.meta.env.VITE_API_HOST ?? "http://127.0.0.1:8000";
const RUTA_SOLICITUD_REPORTE = `${API_HOST}/solicitud-reporte`;

export type SolicitudReporteCreate = {
  rut_medico: string;
  rango_desde: string;
  rango_hasta: string;
  tipo: string;
  formato: string;
  estado: string;
  creado_en: string;
};

export type SolicitudReporteOut = {
  id: number;
  rut_medico: string;
  rango_desde: string;
  rango_hasta: string;
  tipo: string;
  formato: string;
  estado: string;
  creado_en: string;
};

export async function createSolicitudReporte(payload: SolicitudReporteCreate): Promise<SolicitudReporteOut> {
  const resp = await fetch(RUTA_SOLICITUD_REPORTE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.detail || 'Error al crear solicitud de reporte');
  }
  return resp.json();
}

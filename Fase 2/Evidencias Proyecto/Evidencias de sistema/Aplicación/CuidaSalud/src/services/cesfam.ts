// src/services/cesfam.ts
const API_HOST = "http://127.0.0.1:8000";
const RUTA_CESFAM = `${API_HOST}/cesfam`;

export type CesfamOut = {
  id_cesfam: number;
  id_comuna: number;
  nombre_cesfam: string;
  telefono: number | null;
  direccion: string | null;
  email: string | null;
  estado: boolean;
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; details?: any };

export async function listCesfam(params?: {
  page?: number;
  page_size?: number;
  id_comuna?: number;
  estado?: boolean | null; // por defecto true en la API
}) {
  const page = params?.page ?? 1;
  const page_size = params?.page_size ?? 5000;
  const id_comuna = params?.id_comuna;
  const estado = params?.estado ?? true;

  const url = new URL(RUTA_CESFAM);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(page_size));
  if (id_comuna != null) url.searchParams.set("id_comuna", String(id_comuna));
  if (estado !== null) url.searchParams.set("estado", String(estado));

  try {
    const resp = await fetch(url.toString());
    if (!resp.ok) {
      let message = `Error HTTP ${resp.status}`;
      try {
        const err = await resp.json();
        message = typeof err === "string" ? err : err?.message ?? message;
      } catch {}
      return { ok: false, status: resp.status, message } as ApiResult<never>;
    }
    const data = (await resp.json()) as Page<CesfamOut>;
    return { ok: true, data } as ApiResult<Page<CesfamOut>>;
  } catch (e: any) {
    return { ok: false, status: 0, message: e?.message ?? "Fallo de red" } as ApiResult<never>;
  }
}

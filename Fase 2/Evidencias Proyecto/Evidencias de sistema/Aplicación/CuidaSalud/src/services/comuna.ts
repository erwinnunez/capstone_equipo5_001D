// src/services/comuna.ts
const API_HOST = "http://127.0.0.1:8000";
const RUTA_COMUNA = `${API_HOST}/comuna`;

export type ComunaOut = {
  id_comuna: number;
  id_region: number;
  nombre_comuna: string;
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

// Opcional: filtrar por región; por defecto trae muchas para no paginar en UI
export async function listComunas(params?: { page?: number; page_size?: number; id_region?: number }) {
  const page = params?.page ?? 1;
  const page_size = params?.page_size ?? 5000; // grande para llenar el selector
  const id_region = params?.id_region;

  const url = new URL(RUTA_COMUNA);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(page_size));
  if (id_region != null) url.searchParams.set("id_region", String(id_region));

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
    const data = (await resp.json()) as Page<ComunaOut>;
    return { ok: true, data } as ApiResult<Page<ComunaOut>>;
  } catch (e: any) {
    return { ok: false, status: 0, message: e?.message ?? "Fallo de red" } as ApiResult<never>;
  }
}

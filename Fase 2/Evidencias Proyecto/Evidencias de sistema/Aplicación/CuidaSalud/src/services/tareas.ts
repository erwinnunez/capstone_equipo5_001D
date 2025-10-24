// src/services/tareas.ts
const API_HOST = "http://127.0.0.1:8000";
const RUTA_TAREAS = `${API_HOST}/tareas`;

async function handleResponse<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(error || "Error en la solicitud");
  }
  return resp.json();
}

export interface TareaOut {
  id_tarea: number;
  rut_paciente: number;
  descripcion: string;
  creado: string;
  completado: string | null;
  nota_cuidador?: string | null;
}

// Obtener tareas de un paciente
export async function listTareasPaciente(rut_paciente: number): Promise<TareaOut[]> {
  const resp = await fetch(`${RUTA_TAREAS}/${rut_paciente}`);
  return handleResponse<TareaOut[]>(resp);
}

// Crear tarea
export async function createTarea(payload: {
  rut_paciente: number;
  rut_doctor: number;
  descripcion: string;
}): Promise<TareaOut> {
  const resp = await fetch(RUTA_TAREAS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<TareaOut>(resp);
}

// Eliminar tarea
export async function deleteTarea(id_tarea: number): Promise<void> {
  const resp = await fetch(`${RUTA_TAREAS}/${id_tarea}`, { method: "DELETE" });
  if (!resp.ok) throw new Error("Error al eliminar la tarea");
}

//actualizar tarea
export async function updateTarea(id_tarea: number, data: Partial<TareaOut>) {
  const resp = await fetch(`${API_HOST}/tareas/${id_tarea}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error("Error al actualizar tarea");
  }

  return resp.json();
}
// src/hooks/usePacienteCuidador.ts
import { useState, useEffect } from "react";
import { listPacienteCuidador, type PacienteCuidadorOut } from "../services/pacienteCuidador";

interface UsePacienteCuidadorResult {
  pacientes: PacienteCuidadorOut[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePacienteCuidador(): UsePacienteCuidadorResult {
  const [pacientes, setPacientes] = useState<PacienteCuidadorOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPacientes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener RUT del cuidador desde localStorage
      const authDataString = localStorage.getItem("auth");
      if (!authDataString) {
        throw new Error("No se encontraron datos de autenticación");
      }

      const authData = JSON.parse(authDataString);
      const rutCuidador = authData?.user?.id;

      if (!rutCuidador) {
        throw new Error("No se encontró el RUT del cuidador en los datos de autenticación");
      }

      // Llamar al endpoint con el RUT del cuidador
      const response = await listPacienteCuidador({
        rut_cuidador: rutCuidador,
        activo: true, // Solo pacientes activos
        page: 1,
        page_size: 100, // Obtener un número alto para traer todos
      });

      setPacientes(response.items);

    } catch (error: any) {
      console.error("Error al cargar pacientes:", error);
      setError(error?.message || "Error al cargar los pacientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPacientes();
  }, []);

  const refetch = () => {
    loadPacientes();
  };

  return { pacientes, loading, error, refetch };
}
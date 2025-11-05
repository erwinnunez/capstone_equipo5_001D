// src/hooks/useCaregiverStats.ts
import { useState, useEffect } from "react";
import { listPacienteCuidador } from "../services/pacienteCuidador";

interface CaregiverStats {
  assignedCount: number;
  criticalCount: number;
  loading: boolean;
  error: string | null;
}

export function useCaregiverStats(): CaregiverStats {
  const [stats, setStats] = useState<CaregiverStats>({
    assignedCount: 0,
    criticalCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Obtener RUT del cuidador desde localStorage
        const authDataString = localStorage.getItem("auth");
        console.log("🔍 Auth data string:", authDataString);
        
        if (!authDataString) {
          throw new Error("No se encontraron datos de autenticación");
        }

        const authData = JSON.parse(authDataString);
        console.log("🔍 Auth data parsed:", authData);
        
        const rutCuidador = authData?.user?.id;
        console.log("🔍 RUT Cuidador:", rutCuidador);

        if (!rutCuidador) {
          throw new Error("No se encontró el RUT del cuidador en los datos de autenticación");
        }

        // Llamar al endpoint con el RUT del cuidador
        console.log("🔍 Llamando al endpoint con RUT:", rutCuidador);
        const response = await listPacienteCuidador({
          rut_cuidador: rutCuidador,
          activo: true, // Solo pacientes activos
          page: 1,
          page_size: 100, // Obtener un número alto para contar todos
        });
        
        console.log("✅ Respuesta del endpoint:", response);

        // El total nos da el número de pacientes asignados
        const assignedCount = response.total;

        // Por ahora, las alertas críticas las dejamos como mock
        // TODO: implementar endpoint para alertas críticas
        const criticalCount = 0;

        setStats({
          assignedCount,
          criticalCount,
          loading: false,
          error: null,
        });

      } catch (error: any) {
        console.error("Error al cargar estadísticas del cuidador:", error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error?.message || "Error al cargar las estadísticas",
        }));
      }
    };

    loadStats();
  }, []);

  return stats;
}
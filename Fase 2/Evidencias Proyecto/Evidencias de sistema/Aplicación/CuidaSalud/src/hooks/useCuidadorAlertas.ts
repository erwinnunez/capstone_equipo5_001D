// src/hooks/useCuidadorAlertas.ts
import { useState, useEffect } from "react";
import { listarAlertasPorCuidador, type MedicionOut } from "../services/medicion";

export function useCuidadorAlertas(rutCuidador: string | null) {
  const [alertas, setAlertas] = useState<MedicionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rutCuidador) {
      setAlertas([]);
      return;
    }

    const fetchAlertas = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await listarAlertasPorCuidador(rutCuidador);
        
        if (result.ok) {
          setAlertas(result.data);
        } else {
          // Si es 204 (No Content), significa que no hay alertas
          if (result.status === 204) {
            setAlertas([]);
          } else {
            setError(result.message);
          }
        }
      } catch (err) {
        console.error("Error al obtener alertas del cuidador:", err);
        setError("Error al cargar las alertas");
      } finally {
        setLoading(false);
      }
    };

    fetchAlertas();
  }, [rutCuidador]);

  return {
    alertas,
    cantidadAlertas: alertas.length,
    loading,
    error,
    refetch: () => {
      if (rutCuidador) {
        const fetchAlertas = async () => {
          setLoading(true);
          setError(null);
          
          try {
            const result = await listarAlertasPorCuidador(rutCuidador);
            
            if (result.ok) {
              setAlertas(result.data);
            } else {
              if (result.status === 204) {
                setAlertas([]);
              } else {
                setError(result.message);
              }
            }
          } catch (err) {
            console.error("Error al obtener alertas del cuidador:", err);
            setError("Error al cargar las alertas");
          } finally {
            setLoading(false);
          }
        };

        fetchAlertas();
      }
    }
  };
}
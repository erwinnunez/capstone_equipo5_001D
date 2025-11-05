// src/components/cuidador/CuidadorStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, AlertTriangle, Loader2 } from "lucide-react";
import { useCaregiverStats } from "../../hooks/useCaregiverStats";
import { useCuidadorAlertas } from "../../hooks/useCuidadorAlertas";
import { useEffect, useState } from "react";

export default function CuidadorStats() {
  const { assignedCount, loading: loadingPacientes, error: errorPacientes } = useCaregiverStats();
  const [rutCuidador, setRutCuidador] = useState<string | null>(null);
  
  // Obtener RUT del cuidador desde localStorage
  useEffect(() => {
    const authDataString = localStorage.getItem("auth");
    if (authDataString) {
      const authData = JSON.parse(authDataString);
      setRutCuidador(authData?.user?.id || null);
    }
  }, []);

  const { cantidadAlertas, loading: loadingAlertas, error: errorAlertas } = useCuidadorAlertas(rutCuidador);

  const loading = loadingPacientes || loadingAlertas;
  const hasError = errorPacientes || errorAlertas;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes asignados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <div className="text-sm text-muted-foreground">Cargando...</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <div className="text-sm text-muted-foreground">Cargando...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes asignados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Error</div>
            <p className="text-xs text-muted-foreground">{errorPacientes || "Error al cargar pacientes"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Error</div>
            <p className="text-xs text-muted-foreground">{errorAlertas || "Error al cargar alertas"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pacientes asignados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{assignedCount}</div>
          <p className="text-xs text-muted-foreground">Activos bajo tu cuidado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas activas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{cantidadAlertas}</div>
          <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
        </CardContent>
      </Card>
    </div>
  );
}

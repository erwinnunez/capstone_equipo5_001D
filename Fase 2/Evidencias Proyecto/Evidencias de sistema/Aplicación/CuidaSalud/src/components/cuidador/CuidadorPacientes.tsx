import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Users } from "lucide-react";
import { listPacientesPorCuidador, type PacienteAsignado } from "../../services/paciente";
import { formatDistanceToNow } from 'date-fns';
import { es } from "date-fns/locale";

type Variant = "default" | "secondary" | "destructive" | "outline";
const getStatusColor = (status: string): Variant =>
  status === "stable"
    ? "outline"
    : status === "attention_needed"
    ? "secondary"
    : "destructive";

const statusLabel = (s: string) => {
  switch (s) {
    case "stable":
      return "Estable";
    case "attention_needed":
      return "Requiere atención";
    case "critical":
      return "Crítico";
    default:
      return s;
  }
};

export default function CuidadorPacientes({
  onSelectPatient,
}: {
  onSelectPatient: (id: number) => void;
}) {
  const [pacientes, setPacientes] = useState<PacienteAsignado[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    const rutCuidador = auth?.user?.id;

    if (!rutCuidador) {
      console.error("No se encontró rut_cuidador en localStorage");
      setCargando(false);
      return;
    }

    setCargando(true);
    listPacientesPorCuidador(rutCuidador)
      .then((data) => setPacientes(data))
      .catch((err) => console.error("Error al cargar pacientes:", err))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacientes asignados</CardTitle>
        <CardDescription>Pacientes bajo tu cuidado y monitoreo</CardDescription>
      </CardHeader>

      <CardContent>
        {cargando ? (
          <p className="text-gray-500 text-sm text-center">Cargando pacientes...</p>
        ) : pacientes.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No tienes pacientes asignados</p>
        ) : (
          <div className="space-y-4">
            {pacientes.map((p) => (
              <div
                key={p.rut_paciente}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{p.nombre_completo}</h4>
                    <p className="text-sm text-gray-600">
                      Edad {p.edad} • {p.enfermedad_principal ?? "Sin diagnóstico"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Última actualización: {" "}
                      {p.ultima_actualizacion
                        ? formatDistanceToNow(new Date(p.ultima_actualizacion), {locale: es}) + " atrás"
                        : "No disponible"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {p.alertas > 0 && (
                    <Badge variant="destructive">
                      {p.alertas} {p.alertas === 1 ? "alerta" : "alertas"}
                    </Badge>
                  )}
                  <Badge variant={getStatusColor(p.estado)}>
                    {statusLabel(p.estado)}
                  </Badge>
                  <div className="text-right text-sm">
                    <p className="text-gray-600">Próxima cita</p>
                    <p className="font-medium">
                      {p.proxima_cita ?? "Sin programar"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectPatient(p.rut_paciente)}
                  >
                    Ver detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

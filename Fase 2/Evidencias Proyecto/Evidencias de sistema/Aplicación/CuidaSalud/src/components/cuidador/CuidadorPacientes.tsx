import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Users } from "lucide-react";
import { assignedPatients } from "../../data/cuidadorMock.ts";
import type { AssignedPatient } from "../../data/cuidadorMock.ts";

type Variant = "default" | "secondary" | "destructive" | "outline";
const getStatusColor = (status: string): Variant =>
  status === "stable" ? "outline" : status === "attention_needed" ? "secondary" : "destructive";

// Etiqueta visible del estado (sin tocar los valores internos)
const statusLabel = (s: string) => {
  switch (s) {
    case "stable":
      return "Estable";
    case "attention_needed":
      return "Requiere atención";
    case "critical":
      return "Crítico";
    default:
      return s.replace("_", " ");
  }
};

export default function CuidadorPacientes({ onSelectPatient }: { onSelectPatient: (id: number) => void; }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacientes asignados</CardTitle>
        <CardDescription>Pacientes bajo tu cuidado y monitoreo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignedPatients.map((patient: AssignedPatient) => (
            <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium">{patient.name}</h4>
                  <p className="text-sm text-gray-600">Edad {patient.age} • {patient.condition}</p>
                  <p className="text-xs text-gray-500">Última actualización: {patient.lastUpdate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {patient.alerts > 0 && (
                  <Badge variant="destructive">
                    {patient.alerts} {patient.alerts === 1 ? "alerta" : "alertas"}
                  </Badge>
                )}
                <Badge variant={getStatusColor(patient.status)}>{statusLabel(patient.status)}</Badge>
                <div className="text-right text-sm">
                  <p className="text-gray-600">Próxima cita</p>
                  <p className="font-medium">{patient.nextAppointment}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onSelectPatient(patient.id)}>
                  Ver detalles
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

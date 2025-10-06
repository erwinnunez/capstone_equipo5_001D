import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { assignedPatients } from "../../data/cuidadorMock.ts";
import type { AssignedPatient } from "../../data/cuidadorMock.ts";
import { Plus } from "lucide-react";

export default function CuidadorDataEntry() {
  const [newMeasurement, setNewMeasurement] = useState({
    patientId: "",
    type: "",
    value: "",
    notes: "",
  });

  const handleAddMeasurement = () => {
    console.log("Adding measurement:", newMeasurement);
    setNewMeasurement({ patientId: "", type: "", value: "", notes: "" });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Registrar datos del paciente</CardTitle>
          <CardDescription>Ingresa mediciones de salud en nombre de tus pacientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar paciente</label>
              <Select
                value={newMeasurement.patientId}
                onValueChange={(value: string) =>
                  setNewMeasurement({ ...newMeasurement, patientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elige un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {assignedPatients.map((p: AssignedPatient) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de medición</label>
              <Select
                value={newMeasurement.type}
                onValueChange={(value: string) =>
                  setNewMeasurement({ ...newMeasurement, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elige un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood_sugar">Glucosa</SelectItem>
                  <SelectItem value="blood_pressure">Presión arterial</SelectItem>
                  <SelectItem value="oxygen">Nivel de oxígeno</SelectItem>
                  <SelectItem value="temperature">Temperatura</SelectItem>
                  <SelectItem value="weight">Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valor</label>
            <Input
              placeholder="Ingresa el valor de la medición"
              value={newMeasurement.value}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, value: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas (opcional)</label>
            <Input
              placeholder="Notas u observaciones adicionales"
              value={newMeasurement.notes}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
            />
          </div>

          <Button
            onClick={handleAddMeasurement}
            className="w-full"
            disabled={!newMeasurement.patientId || !newMeasurement.type || !newMeasurement.value}
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar medición
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Registros recientes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { patient: "Eleanor Smith", type: "Glucosa",           value: "140 mg/dL", time: "hace 1 hora" },
              { patient: "Robert Johnson", type: "Presión arterial", value: "160/95",    time: "hace 2 horas" },
              { patient: "Mary Wilson",    type: "Temperatura",      value: "98.6°F",    time: "hace 3 horas" },
            ].map((entry, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{entry.patient}</h4>
                  <p className="text-sm text-gray-600">{entry.type}: {entry.value}</p>
                </div>
                <p className="text-sm text-gray-500">{entry.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

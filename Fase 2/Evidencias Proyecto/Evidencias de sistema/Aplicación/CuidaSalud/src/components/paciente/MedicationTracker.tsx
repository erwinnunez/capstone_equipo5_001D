import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";
import { 
  Pill, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Info
} from "lucide-react";

interface MedicationTrackerProps {
  onBack: () => void;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  missed: boolean;
  frequency: string;
  instructions: string;
}

export default function MedicationTracker({ onBack }: MedicationTrackerProps) {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Paracetamol",
      dosage: "500mg",
      time: "08:00",
      taken: true,
      missed: false,
      frequency: "Cada 8 horas",
      instructions: "Tomar con comida"
    },
    {
      id: "2",
      name: "Ibuprofeno",
      dosage: "400mg",
      time: "14:00",
      taken: false,
      missed: false,
      frequency: "Cada 12 horas",
      instructions: "Evitar con el estómago vacío"
    },
    {
      id: "3",
      name: "Vitamina D",
      dosage: "1000 UI",
      time: "20:00",
      taken: false,
      missed: true,
      frequency: "Una vez al día",
      instructions: "Tomar con la cena"
    }
  ]);

  const adherenceRate = Math.round(
    (medications.filter(m => m.taken).length / medications.length) * 100
  );

  const handleMarkTaken = (id: string) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id 
          ? { ...med, taken: true, missed: false }
          : med
      )
    );
  };

  const handleMarkMissed = (id: string) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id 
          ? { ...med, missed: true, taken: false }
          : med
      )
    );
  };

  const todaysTaken = medications.filter(m => m.taken).length;
  const todaysTotal = medications.length;
  const missedMeds = medications.filter(m => m.missed);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-500" />
            Control de Medicación
          </CardTitle>
          <CardDescription>
            Mantén un registro de tu adherencia al tratamiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{todaysTaken}</div>
              <div className="text-sm text-green-700">Tomadas hoy</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{adherenceRate}%</div>
              <div className="text-sm text-blue-700">Adherencia</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{missedMeds.length}</div>
              <div className="text-sm text-amber-700">Perdidas</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso del día</span>
              <span>{todaysTaken}/{todaysTotal}</span>
            </div>
            <Progress value={(todaysTaken / todaysTotal) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Missed Medications Alert */}
      {missedMeds.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Medicaciones perdidas:</strong> Tienes {missedMeds.length} medicación(es) pendiente(s). 
            Consulta con tu médico sobre cómo proceder.
          </AlertDescription>
        </Alert>
      )}

      {/* Medication List */}
      <div className="space-y-4">
        {medications.map((med) => (
          <Card key={med.id} className={`${
            med.taken ? 'border-green-200 bg-green-50' : 
            med.missed ? 'border-red-200 bg-red-50' : 
            'border-border'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      med.taken ? 'bg-green-100 text-green-600' :
                      med.missed ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{med.name}</h4>
                      <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    </div>
                    {med.taken && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Tomada
                      </Badge>
                    )}
                    {med.missed && (
                      <Badge variant="destructive">
                        Perdida
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{med.time} - {med.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>{med.instructions}</span>
                    </div>
                  </div>
                </div>

                {!med.taken && !med.missed && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkMissed(med.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Perdida
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMarkTaken(med.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Marcar tomada
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Consejos para la adherencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p>• <strong>Establece alarmas:</strong> Usa tu teléfono para recordatorios</p>
            <p>• <strong>Rutina fija:</strong> Toma medicamentos a la misma hora diaria</p>
            <p>• <strong>Organizador semanal:</strong> Prepara las dosis con anticipación</p>
            <p>• <strong>No omitas dosis:</strong> Si olvidas una, consulta las instrucciones</p>
            <p>• <strong>Comunica problemas:</strong> Habla con tu médico sobre efectos secundarios</p>
          </div>
        </CardContent>
      </Card>

      {/* Questions for Doctor */}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas para tu médico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• ¿Qué hago si olvido una dosis?</p>
            <p>• ¿Puedo tomar este medicamento con comida?</p>
            <p>• ¿Cuáles son los efectos secundarios que debo reportar?</p>
            <p>• ¿Por cuánto tiempo debo tomar este medicamento?</p>
            <p>• ¿Hay medicamentos o alimentos que debo evitar?</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Volver al inicio
        </Button>
        <Button className="flex-1">
          Compartir con médico
        </Button>
      </div>
    </div>
  );
}
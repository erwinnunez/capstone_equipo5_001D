import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Users, Loader2, AlertTriangle } from "lucide-react";
import { usePacienteCuidador } from "../../hooks/usePacienteCuidador";
import AlertasModal from "./AlertasModal";
import { useState } from "react";

export default function CuidadorPacientes({ onSelectPatient }: { onSelectPatient: (rutPaciente: string) => void; }) {
  const { pacientes, loading, error } = usePacienteCuidador();
  const [selectedPatientRut, setSelectedPatientRut] = useState<string | null>(null);
  const [isAlertasModalOpen, setIsAlertasModalOpen] = useState(false);

  const handleVerAlertas = (rutPaciente: string) => {
    setSelectedPatientRut(rutPaciente);
    setIsAlertasModalOpen(true);
    onSelectPatient(rutPaciente); // Mantener la funcionalidad original
  };

  const closeAlertasModal = () => {
    setIsAlertasModalOpen(false);
    setSelectedPatientRut(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pacientes asignados</CardTitle>
          <CardDescription>Pacientes bajo tu cuidado y monitoreo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Cargando pacientes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pacientes asignados</CardTitle>
          <CardDescription>Pacientes bajo tu cuidado y monitoreo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-destructive">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pacientes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pacientes asignados</CardTitle>
          <CardDescription>Pacientes bajo tu cuidado y monitoreo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay pacientes asignados</h3>
            <p className="text-muted-foreground">
              No tienes pacientes asignados actualmente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacientes asignados</CardTitle>
        <CardDescription>Pacientes bajo tu cuidado y monitoreo ({pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''})</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pacientes.map((paciente) => (
            <div key={paciente.rut_paciente} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium">RUT: {paciente.rut_paciente}</h4>
                  <p className="text-sm text-gray-600">
                    Asignado desde: {formatDate(paciente.fecha_inicio)}
                  </p>
                  {paciente.fecha_fin && (
                    <p className="text-xs text-gray-500">
                      Válido hasta: {formatDate(paciente.fecha_fin)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {paciente.activo ? (
                  <Badge variant="outline">Activo</Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
                
                <div className="text-right text-sm">
                  <div className="space-y-1">
                    {paciente.permiso_registro && (
                      <Badge variant="default" className="text-xs">
                        Permiso Registro
                      </Badge>
                    )}
                    {paciente.permiso_lectura && (
                      <Badge variant="default" className="text-xs">
                        Permiso Lectura
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleVerAlertas(paciente.rut_paciente)}
                >
                  Ver Alertas
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Alertas */}
        <AlertasModal 
          isOpen={isAlertasModalOpen}
          onClose={closeAlertasModal}
          rutPaciente={selectedPatientRut || ""}
        />
      </CardContent>
    </Card>
  );
}

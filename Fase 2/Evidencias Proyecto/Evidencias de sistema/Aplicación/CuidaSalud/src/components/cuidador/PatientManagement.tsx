 // src/components/cuidador/PatientManagement.tsx
import { useState } from "react";
import { usePatients } from "./PatientContext";
import type { Patient } from "./PatientContext";

import { createPacienteCuidador, type PacienteCuidadorCreate } from "../../services/pacienteCuidador";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "../ui/alert-dialog";
import { Users, Plus, Edit, Trash2, Phone, Heart, Calendar, FileText, AlertTriangle } from "lucide-react";

export default function PatientManagement() {
  const { patients, deletePatient, selectPatient, selectedPatientId } = usePatients();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    rut_paciente: "",
    rut_cuidador: "",
    permiso_registro: true,
    permiso_lectura: true,
    fecha_inicio: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    fecha_fin: "", // Opcional, puede estar vacía
    activo: true
  });

  // Estados para manejo del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      rut_paciente: "",
      rut_cuidador: "",
      permiso_registro: true,
      permiso_lectura: true,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: "",
      activo: true
    });
    setSubmitError(null);
  };

  const handleAddPatient = async () => {
    // Validaciones básicas
    if (!formData.rut_paciente.trim() || !formData.rut_cuidador.trim()) {
      setSubmitError("RUT del paciente y RUT del cuidador son obligatorios");
      return;
    }

    if (!formData.fecha_inicio) {
      setSubmitError("Fecha de inicio es obligatoria");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Preparar datos para el endpoint
      const payload: PacienteCuidadorCreate = {
        rut_paciente: formData.rut_paciente.trim(),
        rut_cuidador: formData.rut_cuidador.trim(),
        permiso_registro: formData.permiso_registro,
        permiso_lectura: formData.permiso_lectura,
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año por defecto
        activo: formData.activo,
      };

      // Llamar al endpoint
      const result = await createPacienteCuidador(payload);
      
      console.log("✅ Paciente-Cuidador creado:", result);

      resetForm();
      setIsAddDialogOpen(false);
      
    } catch (error: any) {
      console.error("❌ Error al crear paciente-cuidador:", error);
      setSubmitError(error?.message || "Error al crear la relación paciente-cuidador");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    // Solo datos del endpoint disponibles - no tenemos RUTs en el mock
    setFormData({
      rut_paciente: "", // TODO: agregar RUT a Patient interface
      rut_cuidador: "",
      permiso_registro: true,
      permiso_lectura: true,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: "",
      activo: true
    });
  };

  const handleDeletePatient = (patientId: string) => {
    deletePatient(patientId);
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("es-ES", { year: "numeric", month: "long", day: "numeric" }).format(date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de Pacientes
          </CardTitle>
          <CardDescription>Administre la información de sus pacientes asignados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {patients.length} paciente{patients.length !== 1 ? "s" : ""} bajo su cuidado
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Paciente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[85vw] w-[85vw] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0 pb-3 border-b">
                  <DialogTitle className="text-xl font-semibold">Agregar Nuevo Paciente</DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">Complete la información del nuevo paciente bajo su cuidado</DialogDescription>
                </DialogHeader>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto px-1 min-h-0">
                  {/* Error Message */}
                  {submitError && (
                    <div className="p-2 rounded-md bg-red-50 border border-red-200 mb-3">
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  )}

                  {/* Formulario simplificado - solo campos del endpoint */}
                  <div className="space-y-4 pb-4">
                    <div className="max-w-2xl mx-auto">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-3 w-3 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-blue-900 text-sm">Relación Paciente-Cuidador</h4>
                        </div>                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label htmlFor="rut_paciente" className="text-xs font-medium text-gray-700">
                              RUT del Paciente *
                            </Label>
                            <Input 
                              id="rut_paciente" 
                              placeholder="12345678-9"
                              value={formData.rut_paciente} 
                              onChange={(e) => setFormData({ ...formData, rut_paciente: e.target.value })}
                              className="h-8 text-sm"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor="rut_cuidador" className="text-xs font-medium text-gray-700">
                              RUT del Cuidador *
                            </Label>
                            <Input 
                              id="rut_cuidador" 
                              placeholder="87654321-0"
                              value={formData.rut_cuidador} 
                              onChange={(e) => setFormData({ ...formData, rut_cuidador: e.target.value })}
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label htmlFor="fecha_inicio" className="text-xs font-medium text-gray-700">
                                Fecha de Inicio *
                              </Label>
                              <Input 
                                id="fecha_inicio" 
                                type="date"
                                value={formData.fecha_inicio} 
                                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="fecha_fin" className="text-xs font-medium text-gray-700">
                                Fecha de Fin
                              </Label>
                              <Input 
                                id="fecha_fin" 
                                type="date"
                                value={formData.fecha_fin} 
                                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>

                          {/* Permisos en una sola fila */}
                          <div className="space-y-2 pt-1">
                            <Label className="text-xs font-medium text-gray-700">Permisos</Label>
                            <div className="grid grid-cols-1 gap-1">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="permiso_registro"
                                  checked={formData.permiso_registro}
                                  onChange={(e) => setFormData({ ...formData, permiso_registro: e.target.checked })}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <Label htmlFor="permiso_registro" className="text-xs text-gray-700">
                                  Permiso de Registro
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="permiso_lectura"
                                  checked={formData.permiso_lectura}
                                  onChange={(e) => setFormData({ ...formData, permiso_lectura: e.target.checked })}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <Label htmlFor="permiso_lectura" className="text-xs text-gray-700">
                                  Permiso de Lectura
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="activo"
                                  checked={formData.activo}
                                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                />
                                <Label htmlFor="activo" className="text-xs text-gray-700">
                                  Activo
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer con botones - SIEMPRE VISIBLE */}
                <div className="flex-shrink-0 border-t bg-white p-4 shadow-lg">
                  <div className="flex justify-end gap-4 max-w-2xl mx-auto">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)} 
                      disabled={isSubmitting}
                      className="px-6 h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleAddPatient} 
                      disabled={isSubmitting}
                      className="px-6 h-10 bg-blue-600 hover:bg-blue-700 text-black font-medium shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Agregando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Paciente
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pacientes */}
      <div className="grid gap-4">
        {patients.map((patient) => (
          <Card
            key={patient.id}
            className={`transition-all ${selectedPatientId === patient.id ? "ring-2 ring-primary bg-primary/5" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-medium">{patient.name}</h3>
                    <Badge variant="secondary">{patient.age} años</Badge>
                    {selectedPatientId === patient.id && <Badge variant="default">Seleccionado</Badge>}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectPatient(patient.id)}
                      disabled={selectedPatientId === patient.id}
                    >
                      {selectedPatientId === patient.id ? "Activo" : "Seleccionar"}
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Condición:</span>
                        <span className="text-sm">{patient.condition || "No especificada"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Emergencia:</span>
                        <span className="text-sm">
                          {patient.emergencyContact} - {patient.emergencyPhone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Desde:</span>
                        <span className="text-sm">{formatDate(patient.createdAt)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {patient.medications.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Medicamentos:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patient.medications.slice(0, 2).map((med, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {med}
                              </Badge>
                            ))}
                            {patient.medications.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{patient.medications.length - 2} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {patient.allergies.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-red-600">Alergias:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patient.allergies.map((allergy, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {patient.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">Notas:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* Editar */}
                  <Dialog
                    open={editingPatient?.id === patient.id}
                    onOpenChange={(open: boolean) => { if (!open) setEditingPatient(null); }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleEditPatient(patient)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[60vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Información del Paciente</DialogTitle>
                        <DialogDescription>Vista de solo lectura - datos del paciente existente</DialogDescription>
                      </DialogHeader>

                      {/* Información del paciente */}
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Datos del Paciente</h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Nombre:</span> {editingPatient?.name}</div>
                            <div><span className="font-medium">Edad:</span> {editingPatient?.age} años</div>
                            <div><span className="font-medium">Condición:</span> {editingPatient?.condition}</div>
                            <div><span className="font-medium">Contacto de emergencia:</span> {editingPatient?.emergencyContact}</div>
                            <div><span className="font-medium">Teléfono:</span> {editingPatient?.emergencyPhone}</div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setEditingPatient(null)}>Cerrar</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Eliminar */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente al paciente "{patient.name}" y todos sus datos asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePatient(patient.id)}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {patients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay pacientes asignados</h3>
            <p className="text-muted-foreground mb-4">
              Agregue su primer paciente para comenzar a usar las herramientas de cuidado
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Paciente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

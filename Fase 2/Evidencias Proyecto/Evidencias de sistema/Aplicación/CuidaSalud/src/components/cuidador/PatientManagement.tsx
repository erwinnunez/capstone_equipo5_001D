// src/components/cuidador/PatientManagement.tsx
import { useState } from "react";
import { usePatients } from "./PatientContext";
import type { Patient } from "./PatientContext";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "../ui/alert-dialog";
import { Users, Plus, Edit, Trash2, Phone, Heart, Calendar, FileText, AlertTriangle } from "lucide-react";

export default function PatientManagement() {
  const { patients, addPatient, updatePatient, deletePatient, selectPatient, selectedPatientId } = usePatients();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    condition: "",
    emergencyContact: "",
    emergencyPhone: "",
    medications: "",
    allergies: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      condition: "",
      emergencyContact: "",
      emergencyPhone: "",
      medications: "",
      allergies: "",
      notes: "",
    });
  };

  const handleAddPatient = () => {
    if (!formData.name.trim()) return;

    addPatient({
      name: formData.name,
      age: parseInt(formData.age) || 0,
      condition: formData.condition,
      emergencyContact: formData.emergencyContact,
      emergencyPhone: formData.emergencyPhone,
      medications: formData.medications.split(",").map((m) => m.trim()).filter(Boolean),
      allergies: formData.allergies.split(",").map((a) => a.trim()).filter(Boolean),
      notes: formData.notes,
    });

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: String(patient.age),
      condition: patient.condition,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      medications: patient.medications.join(", "),
      allergies: patient.allergies.join(", "),
      notes: patient.notes,
    });
  };

  const handleUpdatePatient = () => {
    if (!editingPatient || !formData.name.trim()) return;

    updatePatient(editingPatient.id, {
      name: formData.name,
      age: parseInt(formData.age) || 0,
      condition: formData.condition,
      emergencyContact: formData.emergencyContact,
      emergencyPhone: formData.emergencyPhone,
      medications: formData.medications.split(",").map((m) => m.trim()).filter(Boolean),
      allergies: formData.allergies.split(",").map((a) => a.trim()).filter(Boolean),
      notes: formData.notes,
    });

    resetForm();
    setEditingPatient(null);
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
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
                  <DialogDescription>Complete la información del nuevo paciente bajo su cuidado</DialogDescription>
                </DialogHeader>

                {/* Form Agregar */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Edad</Label>
                      <Input id="age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condición/Diagnóstico</Label>
                    <Input id="condition" value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Contacto de emergencia</Label>
                      <Input id="emergencyContact" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Teléfono de emergencia</Label>
                      <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Medicamentos (separados por comas)</Label>
                    <Textarea id="medications" value={formData.medications} onChange={(e) => setFormData({ ...formData, medications: e.target.value })} className="min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Alergias (separadas por comas)</Label>
                    <Input id="allergies" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales</Label>
                    <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="min-h-[100px]" />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddPatient}>Agregar Paciente</Button>
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
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar Paciente</DialogTitle>
                        <DialogDescription>Modifique la información del paciente</DialogDescription>
                      </DialogHeader>

                      {/* Form Editar */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre completo *</Label>
                            <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-age">Edad</Label>
                            <Input id="edit-age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-condition">Condición/Diagnóstico</Label>
                          <Input id="edit-condition" value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-emergencyContact">Contacto de emergencia</Label>
                            <Input id="edit-emergencyContact" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-emergencyPhone">Teléfono de emergencia</Label>
                            <Input id="edit-emergencyPhone" value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-medications">Medicamentos (separados por comas)</Label>
                          <Textarea id="edit-medications" value={formData.medications} onChange={(e) => setFormData({ ...formData, medications: e.target.value })} className="min-h-[80px]" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-allergies">Alergias (separadas por comas)</Label>
                          <Input id="edit-allergies" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-notes">Notas adicionales</Label>
                          <Textarea id="edit-notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="min-h-[100px]" />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setEditingPatient(null)}>Cancelar</Button>
                          <Button onClick={handleUpdatePatient}>Guardar Cambios</Button>
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

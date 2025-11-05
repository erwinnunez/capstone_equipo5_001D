// src/components/cuidador/AddPatientButton.tsx
import { useState, useEffect } from "react";
import { createPacienteCuidador, type PacienteCuidadorCreate } from "../../services/pacienteCuidador";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Eye, 
  Edit,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react";

export default function AddPatientButton() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [cuidadorInfo, setCuidadorInfo] = useState<{ rut: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    rut_paciente: "",
    permiso_registro: true,
    permiso_lectura: true,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: "",
    activo: true
  });

  // Estados para manejo del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cargar información del cuidador al abrir el modal
  useEffect(() => {
    if (isAddDialogOpen) {
      const authDataString = localStorage.getItem("auth");
      if (authDataString) {
        const authData = JSON.parse(authDataString);
        setCuidadorInfo({
          rut: authData?.user?.id || "",
          name: authData?.user?.name || "Cuidador"
        });
      }
    }
  }, [isAddDialogOpen]);

  const resetForm = () => {
    setFormData({
      rut_paciente: "",
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
    if (!formData.rut_paciente.trim()) {
      setSubmitError("El RUT del paciente es obligatorio");
      return;
    }

    if (!cuidadorInfo?.rut) {
      setSubmitError("No se pudo obtener la información del cuidador");
      return;
    }

    if (!formData.fecha_inicio) {
      setSubmitError("La fecha de inicio es obligatoria");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Preparar datos para el endpoint
      const payload: PacienteCuidadorCreate = {
        rut_paciente: formData.rut_paciente.trim(),
        rut_cuidador: cuidadorInfo.rut,
        permiso_registro: formData.permiso_registro,
        permiso_lectura: formData.permiso_lectura,
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        activo: formData.activo,
      };

      // Llamar al endpoint
      const result = await createPacienteCuidador(payload);
      
      console.log("✅ Paciente-Cuidador creado:", result);

      resetForm();
      setIsAddDialogOpen(false);
      
      // Mostrar mensaje de éxito más elegante
      // TODO: Implementar toast notification system
      alert("✅ Paciente agregado exitosamente");
      
    } catch (error: any) {
      console.error("❌ Error al crear paciente-cuidador:", error);
      setSubmitError(error?.message || "Error al crear la relación paciente-cuidador");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-black shadow-lg transition-all duration-200">
          <UserPlus className="h-4 w-4" />
          Agregar Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-[90vw] max-h-[85vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader className="flex-shrink-0 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-800">
                Agregar Nuevo Paciente
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                Establece una nueva relación de cuidado
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {/* Error Message */}
          {submitError && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Información del Cuidador */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{cuidadorInfo?.name || "Cargando..."}</p>
                <p className="text-xs text-gray-600">RUT: {cuidadorInfo?.rut || "..."}</p>
              </div>
            </div>
          </div>

          {/* Información del Paciente */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rut_paciente" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-3 w-3" />
                RUT del Paciente *
              </Label>
              <Input 
                id="rut_paciente" 
                placeholder="12.345.678-9"
                value={formData.rut_paciente} 
                onChange={(e) => setFormData({ ...formData, rut_paciente: e.target.value })}
                className="h-9 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            {/* Fechas en una fila */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fecha_inicio" className="text-xs font-medium text-gray-700">
                  Fecha de Inicio *
                </Label>
                <Input 
                  id="fecha_inicio" 
                  type="date"
                  value={formData.fecha_inicio} 
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="h-8 text-sm border-gray-200 focus:border-blue-400"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fecha_fin" className="text-xs font-medium text-gray-700">
                  Fecha de Fin (opcional)
                </Label>
                <Input 
                  id="fecha_fin" 
                  type="date"
                  value={formData.fecha_fin} 
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="h-8 text-sm border-gray-200 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Permisos compactos */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Shield className="h-3 w-3" />
                Permisos
              </Label>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Edit className="h-3 w-3 text-gray-600" />
                    <span className="text-sm text-gray-800">Registro de mediciones</span>
                  </div>
                  <input
                    type="checkbox"
                    id="permiso_registro"
                    checked={formData.permiso_registro}
                    onChange={(e) => setFormData({ ...formData, permiso_registro: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-gray-600" />
                    <span className="text-sm text-gray-800">Lectura de datos</span>
                  </div>
                  <input
                    type="checkbox"
                    id="permiso_lectura"
                    checked={formData.permiso_lectura}
                    onChange={(e) => setFormData({ ...formData, permiso_lectura: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-gray-600" />
                    <span className="text-sm text-gray-800">Relación activa</span>
                  </div>
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer compacto */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3">
          <div className="flex justify-end items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)} 
                disabled={isSubmitting}
                className="px-4 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddPatient} 
                disabled={isSubmitting || !formData.rut_paciente.trim()}
                className="px-4 text-sm bg-blue-600 hover:bg-blue-700 text-black shadow-md transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 mr-2" />
                    Agregar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
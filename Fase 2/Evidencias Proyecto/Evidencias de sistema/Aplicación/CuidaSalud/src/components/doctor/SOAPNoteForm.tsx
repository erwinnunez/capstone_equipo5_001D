import { useState } from 'react';
import { createNotaClinica } from '../../services/soapNote';
import { Button } from '../ui/button';
import { ConfirmModal } from '../common/ConfirmModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function SOAPNoteForm() {
  // Obtener rut del médico logeado (robusto, igual que MedicalDashboard)
  function extractRutFromObject(obj: any): number | null {
    if (!obj) return null;
    const cands = [
      obj?.medico?.rut_medico,
      obj?.rut_medico,
      obj?.rutMedico,
      obj?.rut,
      obj?.user?.rut_medico,
      obj?.user?.rutMedico,
      obj?.user?.rut,
      obj?.user?.id,
      obj?.id,
    ];
    for (const c of cands) {
      if (c != null && !Number.isNaN(Number(c))) return Number(c);
    }
    return null;
  }

  function getLoggedMedicoRut(): string {
    // 1) Revisar sesión
    const sessionStr = localStorage.getItem("session");
    if (sessionStr) {
      try {
        const s = JSON.parse(sessionStr);
        const rut = extractRutFromObject(s);
        if (rut != null) return String(rut);
      } catch {}
    }

    // 2) Revisar otras claves típicas de usuario
    for (const k of ["auth", "user", "current_user", "front_user"]) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        const rut = extractRutFromObject(obj);
        if (rut != null) return String(rut);
      } catch {}
    }

    // 3) Revisar JWT
    const jwt = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (jwt && jwt.split(".").length === 3) {
      try {
        const payloadJson = atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"));
        const p = JSON.parse(payloadJson);
        const rut =
          p?.rut_medico ??
          p?.rutMedico ??
          p?.sub_rut ??
          p?.subRut ??
          p?.rut ??
          p?.id ??
          null;
        if (rut != null) return String(rut);
      } catch {}
    }

    // 4) Último recurso: clave suelta 'medico_rut'
    const direct = localStorage.getItem("medico_rut");
    if (direct) return String(direct);

    return "";
  }

  const rutMedicoLogeado = getLoggedMedicoRut();

  const [formData, setFormData] = useState({
    rut_paciente: '',
    rut_medico: rutMedicoLogeado,
    tipo_autor: '',
    nota: '',
    tipo_nota: '',
    creada_en: new Date().toISOString(),
  });

  // ...existing code...
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSOAPNote = async () => {
    // Validar campos obligatorios antes de mostrar el modal de confirmación
    if (!formData.rut_paciente || !formData.nota || !formData.tipo_autor || !formData.tipo_nota) {
      setErrorModalOpen(true);
      return;
    }
    if (!rutMedicoLogeado) {
      setErrorModalOpen(true);
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    // Validación básica al confirmar
    if (!formData.rut_paciente || !formData.nota || !formData.tipo_autor || !formData.tipo_nota) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    if (!rutMedicoLogeado) {
      toast.error('No se pudo obtener el rut del médico logeado');
      return;
    }
    
    const payload = {
      ...formData,
      rut_medico: rutMedicoLogeado,
      creada_en: new Date().toISOString(),
    };

    try {
      await createNotaClinica(payload);
      setSuccessModalOpen(true);
      setFormData({
        rut_paciente: '',
        rut_medico: rutMedicoLogeado,
        tipo_autor: '',
        nota: '',
        tipo_nota: '',
        creada_en: new Date().toISOString(),
      });
    } catch (e) {
      toast.error('Error al guardar la nota clínica');
    }
  };

  // ...existing code...

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nota SOAP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>RUT Paciente</Label>
          <Input value={formData.rut_paciente} onChange={e => handleInputChange('rut_paciente', e.target.value)} placeholder="Ej: 12345678K" />
          {/* Se eliminó el label y campo de rut médico */}
          <Label>Tipo Autor</Label>
          <Input value={formData.tipo_autor} onChange={e => handleInputChange('tipo_autor', e.target.value)} placeholder="Ej: doctor" />
          <Label>Tipo Nota</Label>
          <Input value={formData.tipo_nota} onChange={e => handleInputChange('tipo_nota', e.target.value)} placeholder="Ej: SOAP" />
          <Label>Nota</Label>
          <Textarea value={formData.nota} onChange={e => handleInputChange('nota', e.target.value)} placeholder="Escribe la nota SOAP aquí..." rows={6} />
          <Button onClick={handleSaveSOAPNote} className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Guardar Nota SOAP
          </Button>
        </CardContent>
      </Card>
      <ConfirmModal
        open={confirmOpen}
        title="¿Confirmar registro de nota SOAP?"
        message="¿Estás seguro de que deseas guardar esta nota clínica?"
        confirmText="Sí, guardar"
        cancelText="Cancelar"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />
      <ConfirmModal
        open={errorModalOpen}
        title="Error al guardar nota clínica"
        message={
          !rutMedicoLogeado
            ? "No se pudo obtener el rut del médico logeado. Por favor, inicia sesión nuevamente."
            : "Completa todos los campos obligatorios antes de continuar."
        }
        confirmText="Cerrar"
        cancelText=""
        onConfirm={() => setErrorModalOpen(false)}
        onCancel={() => setErrorModalOpen(false)}
      />
      <ConfirmModal
        open={successModalOpen}
        title="Nota clínica guardada"
        message="La nota clínica se ha guardado correctamente."
        confirmText="Aceptar"
        cancelText=""
        onConfirm={() => setSuccessModalOpen(false)}
        onCancel={() => setSuccessModalOpen(false)}
      />
    </div>
  );
}
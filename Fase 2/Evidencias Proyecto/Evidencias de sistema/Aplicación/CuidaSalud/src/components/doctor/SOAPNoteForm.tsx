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
  const [formData, setFormData] = useState({
    rut_paciente: '',
    rut_medico: '',
    tipo_autor: '',
    nota: '',
    tipo_nota: '',
    creada_en: new Date().toISOString(),
  });

  // ...existing code...
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSOAPNote = async () => {
    // Validación básica
    if (!formData.rut_paciente || !formData.rut_medico || !formData.nota || !formData.tipo_autor || !formData.tipo_nota) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    const payload = {
      ...formData,
      creada_en: new Date().toISOString(),
    };
    try {
      await createNotaClinica(payload);
      toast.success('Nota clínica guardada correctamente');
      setFormData({
        rut_paciente: '',
        rut_medico: '',
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
          <Label>RUT Médico</Label>
          <Input value={formData.rut_medico} onChange={e => handleInputChange('rut_medico', e.target.value)} placeholder="Ej: 12345678K" />
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
    </div>
  );
}
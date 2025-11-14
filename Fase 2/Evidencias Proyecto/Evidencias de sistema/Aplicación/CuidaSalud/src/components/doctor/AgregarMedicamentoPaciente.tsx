import React, { useEffect, useState } from 'react';
import { listMedicinas, createMedicinaDetalle } from '../../services/medicacion';
import type { MedicinaOut } from '../../services/medicacion';
import { useAuth } from '../../state/auth';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { ConfirmModal } from '../common/ConfirmModal';
import ErrorAlertModal from '../common/ErrorAlertModal';
// import SuccessModal from '../common/SuccessModal';

const initialForm = {
  id_medicina: 0,
  rut_paciente: '',
  dosis: '',
  instrucciones_toma: '',
  fecha_inicio: '',
  fecha_fin: '',
  tomada: false,
  fecha_tomada: '',
};

export default function AgregarMedicamentoPaciente() {
  const { auth } = useAuth();
  const [medicinas, setMedicinas] = useState<MedicinaOut[]>([]);
  // Ya no se usa la lista de pacientes
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    listMedicinas({ page_size: 100 })
      .then(res => setMedicinas(res.items))
      .catch(() => setMedicinas([]));
  }, []);

  if (auth?.user?.role !== 'doctor') {
    return <div className="p-4 text-red-600">Solo los médicos pueden agregar medicamentos a pacientes.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      // Solo permitir números y k/K en rut_paciente
      if (name === 'rut_paciente') {
        const filtered = value.replace(/[^0-9kK]/g, '');
        setForm(f => ({ ...f, [name]: filtered }));
      } else {
        setForm(f => ({ ...f, [name]: value }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setError('');
    try {
      // Construir el payload con todos los campos requeridos
      const {
        id_medicina,
        rut_paciente,
        dosis,
        instrucciones_toma,
        fecha_inicio,
        fecha_fin,
        tomada,
        fecha_tomada,
      } = form;
      const payload = {
        id_medicina,
        rut_paciente,
        dosis,
        instrucciones_toma,
        fecha_inicio,
        fecha_fin,
        tomada: Boolean(tomada),
        fecha_tomada: Boolean(tomada) ? fecha_tomada : undefined,
      };
      console.log('Payload enviado a medicina detalle:', payload);
      await createMedicinaDetalle(payload);
      setSuccessModalOpen(true);
      setForm(initialForm);
    } catch (err: any) {
      if (err?.message?.includes('Failed to fetch')) {
        setError('No existe el paciente con ese RUT.');
      } else if (err?.message?.toLowerCase().includes('not found') || err?.message?.toLowerCase().includes('no existe')) {
        setError('No existe el paciente con ese RUT.');
      } else {
        setError(err?.message || 'Error al agregar medicamento');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Agregar Medicamento a Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        {auth?.user?.role !== 'doctor' ? (
          <div className="text-red-600 text-center py-8 font-semibold">Solo los médicos pueden agregar medicamentos a pacientes.</div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">RUT del paciente</label>
              <Input
                name="rut_paciente"
                value={form.rut_paciente}
                onChange={handleChange}
                required
                placeholder="Ej: 12345678K"
                pattern="^[0-9]+[0-9kK]$"
                title="Ingrese el RUT en formato 12345678K"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Medicamento</label>
              <Select value={form.id_medicina ? String(form.id_medicina) : ''} onValueChange={(v: string) => handleChange({ target: { name: 'id_medicina', value: v, type: 'select-one' } } as React.ChangeEvent<HTMLSelectElement>)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione medicamento" />
                </SelectTrigger>
                <SelectContent>
                  {medicinas.map(m => (
                    <SelectItem key={m.id_medicina} value={String(m.id_medicina)}>{m.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dosis</label>
              <Input name="dosis" value={form.dosis} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instrucciones de toma</label>
              <Input name="instrucciones_toma" value={form.instrucciones_toma} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha inicio</label>
                <Input type="datetime-local" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha fin</label>
                <Input type="datetime-local" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center mt-2">
                <input type="checkbox" name="tomada" checked={form.tomada} onChange={handleChange} className="mr-2" />
                <label className="text-sm">¿Ya fue tomada?</label>
              </div>
              {form.tomada && (
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha tomada</label>
                  <Input type="datetime-local" name="fecha_tomada" value={form.fecha_tomada} onChange={handleChange} required={form.tomada} />
                </div>
              )}
            </div>
            {error && (
              <ErrorAlertModal open={!!error} message={error} onClose={() => setError('')} />
            )}
            <ConfirmModal
              open={successModalOpen}
              title="Medicamento agregado"
              message="El medicamento se ha guardado correctamente."
              confirmText="Aceptar"
              cancelText=""
              onConfirm={() => setSuccessModalOpen(false)}
              onCancel={() => setSuccessModalOpen(false)}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar Medicamento'}
            </Button>
            <ConfirmModal
              open={confirmOpen}
              title="¿Confirmar registro de medicamento?"
              message="¿Está seguro que desea agregar este medicamento al paciente?"
              confirmText="Sí, agregar"
              cancelText="Cancelar"
              onConfirm={handleConfirm}
              onCancel={() => setConfirmOpen(false)}
            />
          </form>
        )}
      </CardContent>
    </Card>
  );
}

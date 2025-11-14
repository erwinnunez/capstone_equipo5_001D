import { useState, useEffect } from 'react';
import { useAuth } from '../../state/auth';
import { listParametrosClinicos } from '../../services/parametroClinico';
import { Button } from '../ui/button';
import { ConfirmModal } from '../common/ConfirmModal';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { createRangoPaciente } from '../../services/rangoPaciente';

export default function AgregarRangoPaciente() {
  const [parametros, setParametros] = useState<any[]>([]);
  const [isMedico, setIsMedico] = useState(false);
  const { auth } = useAuth();
  const [form, setForm] = useState({
    rut_paciente: '',
    id_parametro: '',
    min_normal: '',
    max_normal: '',
    min_critico: '',
    max_critico: '',
    vigencia_desde: '',
    vigencia_hasta: '',
    version: 1,
    definido_por: 'true',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    async function fetchParametros() {
      try {
        const resp = await listParametrosClinicos({ page: 1, page_size: 100 });
        setParametros(resp.items || []);
      } catch (e) {
        setError('Error al cargar parámetros clínicos');
      }
    }
    fetchParametros();
    // Validar rol de usuario
    const role = auth?.user?.role;
  setIsMedico(role === 'doctor');
  }, [auth]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      const payload = {
        ...form,
        id_parametro: Number(form.id_parametro),
        min_normal: Number(form.min_normal),
        max_normal: Number(form.max_normal),
        min_critico: Number(form.min_critico),
        max_critico: Number(form.max_critico),
        vigencia_desde: form.vigencia_desde,
        vigencia_hasta: form.vigencia_hasta,
        version: Number(form.version),
        definido_por: form.definido_por === 'true',
      };
      await createRangoPaciente(payload);
      setSuccessModalOpen(true);
      setForm({
        rut_paciente: '',
        id_parametro: '',
        min_normal: '',
        max_normal: '',
        min_critico: '',
        max_critico: '',
        vigencia_desde: '',
        vigencia_hasta: '',
        version: 1,
        definido_por: 'true',
      });
    } catch (e: any) {
      setError(e?.message || 'Error al agregar rango');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Agregar Rango Específico a Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        {!isMedico ? (
          <div className="text-red-600 text-center py-8 font-semibold">Solo los médicos pueden agregar rangos específicos a pacientes.</div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">RUT Paciente</label>
              <Input value={form.rut_paciente} onChange={e => handleChange('rut_paciente', e.target.value)} placeholder="Ej: 12345678K" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parámetro Clínico</label>
              <Select value={form.id_parametro} onValueChange={(v: string) => handleChange('id_parametro', v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona parámetro" />
                </SelectTrigger>
                <SelectContent>
                  {parametros.map(p => (
                    <SelectItem key={p.id_parametro} value={String(p.id_parametro)}>
                      {p.descipcion || p.codigo || `Parámetro ${p.id_parametro}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Normal</label>
                <Input type="number" value={form.min_normal} onChange={e => handleChange('min_normal', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Normal</label>
                <Input type="number" value={form.max_normal} onChange={e => handleChange('max_normal', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Crítico</label>
                <Input type="number" value={form.min_critico} onChange={e => handleChange('min_critico', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Crítico</label>
                <Input type="number" value={form.max_critico} onChange={e => handleChange('max_critico', e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vigencia Desde</label>
                <Input type="datetime-local" value={form.vigencia_desde} onChange={e => handleChange('vigencia_desde', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vigencia Hasta</label>
                <Input type="datetime-local" value={form.vigencia_hasta} onChange={e => handleChange('vigencia_hasta', e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Versión</label>
                <Input type="number" value={form.version} onChange={e => handleChange('version', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Definido por usuario</label>
                <Select value={form.definido_por} onValueChange={(v: string) => handleChange('definido_por', v)} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <ConfirmModal
              open={successModalOpen}
              title="Rango agregado"
              message="El rango se ha guardado correctamente."
              confirmText="Aceptar"
              cancelText=""
              onConfirm={() => setSuccessModalOpen(false)}
              onCancel={() => setSuccessModalOpen(false)}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar Rango'}
            </Button>
            <ConfirmModal
              open={confirmOpen}
              title="¿Confirmar registro de rango?"
              message="¿Estás seguro de que deseas agregar este rango específico al paciente?"
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

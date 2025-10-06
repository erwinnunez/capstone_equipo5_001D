import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
//import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Users, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getPacientes } from '../../services/paciente';

type PacienteOut = {
  rut_paciente: number;
  id_comuna: number;
  primer_nombre_paciente: string;
  segundo_nombre_paciente: string;
  primer_apellido_paciente: string;
  segundo_apellido_paciente: string;
  fecha_nacimiento: string;
  sexo: boolean;
  tipo_de_sangre: string;
  enfermedades: string;
  seguro: string;
  direccion: string;
  telefono: number;
  email: string;
  contrasena: string;
  tipo_paciente: string;
  nombre_contacto: string;
  telefono_contacto: number;
  estado: boolean;
  id_cesfam: number;
  fecha_inicio_cesfam: string;
  fecha_fin_cesfam?: string | null;
  activo_cesfam: boolean;
}

interface ApiResponse {
  items: PacienteOut[];
  total: number;
  page: number;
  page_size: number;
}

type pacienteDialog = {
  paciente: PacienteOut;
  children: React.ReactNode
}

export const DialogHandle: React.FC<pacienteDialog> = ({ paciente, children }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] w-[90vw] max-w-4xl overflow-auto p-6 bg-white rounded-md shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-6">
            {paciente.primer_nombre_paciente} {paciente.segundo_nombre_paciente}{' '}
            {paciente.primer_apellido_paciente} {paciente.segundo_apellido_paciente}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 px-8">
          {/* Grupo: Datos personales */}
          <div>
            <div className="text-base font-semibold mb-3 text-gray-700">Datos personales</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">RUT</label>
                <Input value={String(paciente.rut_paciente)} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Comuna</label>
                <Input value={String(paciente.id_comuna)} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Edad</label>
                <Input value={String(calculateAge(paciente.fecha_nacimiento))} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Sexo</label>
                <Input value={paciente.sexo ? 'Masculino' : 'Femenino'} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Tipo de Sangre</label>
                <Input value={paciente.tipo_de_sangre} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Seguro</label>
                <Input value={paciente.seguro} readOnly className="rounded" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Dirección</label>
                <Input value={paciente.direccion} readOnly className="rounded" />
              </div>
            </div>
          </div>
          {/* Grupo: Contacto y estado */}
          <div>
            <div className="text-base font-semibold mb-3 text-gray-700">Contacto y estado</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Teléfono</label>
                <Input value={String(paciente.telefono)} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
                <Input value={paciente.email} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Tipo Paciente</label>
                <Input value={paciente.tipo_paciente} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Enfermedades</label>
                <Input value={paciente.enfermedades} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Contacto</label>
                <Input value={paciente.nombre_contacto} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Teléfono Contacto</label>
                <Input value={String(paciente.telefono_contacto)} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Estado</label>
                <Input value={paciente.estado ? 'Activo' : 'Inactivo'} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Activo Cesfam</label>
                <Input value={paciente.activo_cesfam ? 'Sí' : 'No'} readOnly className="rounded" />
              </div>
            </div>
          </div>
          {/* Grupo: Fechas */}
          <div>
            <div className="text-base font-semibold mb-3 text-gray-700">Vigencia</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Inicio Cesfam</label>
                <Input value={new Date(paciente.fecha_inicio_cesfam).toLocaleDateString()} readOnly className="rounded" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Fin Cesfam</label>
                <Input value={paciente.fecha_fin_cesfam ? new Date(paciente.fecha_fin_cesfam).toLocaleDateString() : '-'} readOnly className="rounded" />
              </div>
            </div>
          </div>
        </div>


        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
};

function calculateAge(dateString: string): number {
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function DoctorPatients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [patients, setPatients] = useState<PacienteOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPacientes<ApiResponse>()
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setPatients(data.items);
        } else {
          setPatients([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error cargando pacientes');
        setLoading(false);
      });
  }, []);

  const mapRiskLevel = (p: PacienteOut): 'high' | 'medium' | 'low' => {
    if (!p.enfermedades) return 'low';
    const enf = p.enfermedades.toLowerCase();
    if (enf.includes('diabetes') || enf.includes('cardio') || enf.includes('cancer')) return 'high';
    if (enf.length > 0) return 'medium';
    return 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const nombreCompleto = `${patient.primer_nombre_paciente} ${patient.segundo_nombre_paciente ?? ''} ${patient.primer_apellido_paciente} ${patient.segundo_apellido_paciente}`;
    const matchesSearch = nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase());
    const risk = mapRiskLevel(patient);
    const matchesRisk = filterRisk === 'all' || risk === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de pacientes</CardTitle>
        <CardDescription>Monitoreo y gestión del estado de salud</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los riesgos</SelectItem>
              <SelectItem value="high">Alto riesgo</SelectItem>
              <SelectItem value="medium">Riesgo medio</SelectItem>
              <SelectItem value="low">Bajo riesgo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && <p>Cargando pacientes...</p>}
        {error && <p className="text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="space-y-3">
            {filteredPatients.length === 0 && <p>No se encontraron pacientes.</p>}
            {filteredPatients.map((patient) => {
              const riskLevel = mapRiskLevel(patient);
              const nombreCompleto = `${patient.primer_nombre_paciente} ${patient.segundo_nombre_paciente ?? ''} ${patient.primer_apellido_paciente} ${patient.segundo_apellido_paciente}`;
              return (
                <div
                  key={patient.rut_paciente}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{nombreCompleto}</h4>
                      <p className="text-sm text-gray-600">
                        Edad {calculateAge(patient.fecha_nacimiento)} • Tipo {patient.tipo_paciente}
                      </p>
                      <p className="text-xs text-gray-500">Email: {patient.email}</p>
                      <p className="text-xs text-gray-500">
                        Enfermedades: {patient.enfermedades || 'Ninguna registrada'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={getRiskColor(riskLevel)}>{riskLevel} riesgo</Badge>

                    <DialogHandle paciente={patient}>

                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Ver detalles
                      </Button>
                    </DialogHandle>

                  </div>
                </div>
              );
            })}
          </div>
        )}


      </CardContent>
    </Card>
  );
}

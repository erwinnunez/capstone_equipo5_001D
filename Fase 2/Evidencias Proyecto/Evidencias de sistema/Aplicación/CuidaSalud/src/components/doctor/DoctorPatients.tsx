import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Users, Search, Filter, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { getPacientes } from '../../services/paciente.ts';
import { listarMedicionesConAlerta, MedicionOut, listMedicionDetalles, MedicionDetalleOut } from '../../services/medicion.ts';
import { listComunas, ComunaOut } from '../../services/comuna.ts';
import { listCesfam, CesfamOut } from '../../services/cesfam.ts';

// ---------- TIPOS ----------
type PacienteOut = {
  rut_paciente: string;
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
};

interface ApiResponse {
  items: PacienteOut[];
  total: number;
  page: number;
  page_size: number;
}

type pacienteDialog = {
  paciente: PacienteOut;
  comunas: ComunaOut[];
  cesfams: CesfamOut[];
  children: React.ReactNode
};

// ---------- MODAL DE DETALLE ----------
function InputDato({ label, value }: { label: string, value: string }) {
  return (
    <div className="min-w-[160px]">
      <label className="text-xs font-medium text-gray-600 mb-0.5 block">{label}</label>
      <Input value={value} readOnly className="rounded px-3 py-1 h-8 text-sm bg-gray-50" />
    </div>
  );
}

export const DialogHandle: React.FC<pacienteDialog> = ({ paciente, comunas, cesfams, children }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // MODAL ALERTAS
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertas, setAlertas] = useState<MedicionOut[]>([]);
  const [alertasLoading, setAlertasLoading] = useState(false);
  const [alertasError, setAlertasError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAlertas, setTotalAlertas] = useState(0);
  const pageSize = 5;

  // MODAL DETALLE DE ALERTA INDIVIDUAL
  const [detalleAlertaOpen, setDetalleAlertaOpen] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<MedicionOut | null>(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [detalles, setDetalles] = useState<MedicionDetalleOut[]>([]);

  useEffect(() => {
    if (detalleAlertaOpen && alertaSeleccionada) {
      setLoadingDetalles(true);
      listMedicionDetalles({ id_medicion: alertaSeleccionada.id_medicion, page_size: 20 })
        .then(res => {
          setDetalles(res.ok ? res.data.items : []);
          setLoadingDetalles(false);
        })
        .catch(() => {
          setDetalles([]);
          setLoadingDetalles(false);
        });
    } else {
      setDetalles([]);
      setLoadingDetalles(false);
    }
  }, [detalleAlertaOpen, alertaSeleccionada]);

  const handleVerProgreso = () => {
    alert('Ver progreso del paciente no implementado aún.');
  };

  const handleVerAlertas = async () => {
    setAlertasError(null);
    setAlertasLoading(true);
    setAlertModalOpen(true);
    setCurrentPage(1);
    await cargarAlertas(1);
  };

  const cargarAlertas = async (page: number) => {
    setAlertasLoading(true);
    const res = await listarMedicionesConAlerta(page, pageSize, { rut_paciente: paciente.rut_paciente });
    setAlertasLoading(false);
    if (res.ok) {
      setAlertas(res.data.items);
      setTotalAlertas(res.data.total);
    } else {
      setAlertasError(res.message);
      setAlertas([]);
      setTotalAlertas(0);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    cargarAlertas(newPage);
  };

  const handleClickAlerta = (alerta: MedicionOut) => {
    setAlertaSeleccionada(alerta);
    setDetalleAlertaOpen(true);
  };

  function nombreComuna(id: number) {
    const comuna = comunas.find(c => c.id_comuna === id);
    return comuna ? comuna.nombre_comuna : `Comuna ${id}`;
  }
  function nombreCesfam(id: number) {
    const cesfam = cesfams.find(c => c.id_cesfam === id);
    return cesfam ? cesfam.nombre_cesfam : `Cesfam ${id}`;
  }

  const renderDetalleRow = (d: MedicionDetalleOut) => (
    <div key={d.id_detalle} className="bg-white rounded border px-3 py-2 shadow-sm text-xs space-y-1">
      <div>
        <span className="font-medium">Parámetro:</span> {d.id_parametro}
      </div>
      <div>
        <span className="font-medium">Valor:</span> {d.valor_num ?? d.valor_texto ?? '—'}
      </div>
      <div>
        <span className="font-medium">Tipo alerta:</span> {d.tipo_alerta}
      </div>
      <div>
        <span className="font-medium">Severidad:</span> <span className="capitalize">{d.severidad}</span>
      </div>
      {d.fuera_rango && <span className="text-destructive text-xs">¡Fuera de rango!</span>}
    </div>
  );

  const totalPages = Math.ceil(totalAlertas / pageSize);

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] w-[90vw] max-w-4xl overflow-auto p-6 bg-white rounded-md shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-2">
              {paciente.primer_nombre_paciente} {paciente.segundo_nombre_paciente}{' '}
              {paciente.primer_apellido_paciente} {paciente.segundo_apellido_paciente}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-8 px-2">
            {/* Datos personales */}
            <section>
              <h3 className="text-lg font-semibold text-primary flex items-center mb-2 border-b pb-1">
                Datos personales
              </h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <InputDato label="RUT" value={String(paciente.rut_paciente)} />
                <InputDato label="Comuna" value={nombreComuna(paciente.id_comuna)} />
                <InputDato label="Cesfam" value={nombreCesfam(paciente.id_cesfam)} />
                <InputDato label="Edad" value={String(calculateAge(paciente.fecha_nacimiento))} />
                <InputDato label="Sexo" value={paciente.sexo ? 'Masculino' : 'Femenino'} />
                <InputDato label="Tipo de Sangre" value={paciente.tipo_de_sangre} />
                <InputDato label="Seguro" value={paciente.seguro} />
                <div className="col-span-2">
                  <InputDato label="Dirección" value={paciente.direccion} />
                </div>
              </div>
            </section>
            <hr className="my-2 border-gray-200" />
            {/* Contacto y estado */}
            <section>
              <h3 className="text-lg font-semibold text-primary flex items-center mb-2 border-b pb-1">
                Contacto y estado
              </h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <InputDato label="Teléfono" value={String(paciente.telefono)} />
                <InputDato label="Email" value={paciente.email} />
                <InputDato label="Tipo Paciente" value={paciente.tipo_paciente} />
                <InputDato label="Enfermedades" value={paciente.enfermedades} />
                <InputDato label="Contacto" value={paciente.nombre_contacto} />
                <InputDato label="Teléfono Contacto" value={String(paciente.telefono_contacto)} />
                <InputDato label="Estado" value={paciente.estado ? 'Activo' : 'Inactivo'} />
                <InputDato label="Activo Cesfam" value={paciente.activo_cesfam ? 'Sí' : 'No'} />
              </div>
            </section>
            <hr className="my-2 border-gray-200" />
            {/* Fechas */}
            <section>
              <h3 className="text-lg font-semibold text-primary flex items-center mb-2 border-b pb-1">
                Vigencia
              </h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <InputDato label="Inicio Cesfam" value={new Date(paciente.fecha_inicio_cesfam).toLocaleDateString()} />
                <InputDato label="Fin Cesfam" value={paciente.fecha_fin_cesfam ? new Date(paciente.fecha_fin_cesfam).toLocaleDateString() : '-'} />
              </div>
            </section>
          </div>
          <div className="flex justify-between items-center gap-2 mt-8">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleVerProgreso}>
                Ver progreso
              </Button>
              <Button variant="secondary" onClick={handleVerAlertas}>
                Ver alertas
              </Button>
            </div>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DE ALERTAS (LISTA PAGINADA) */}
      <Dialog open={alertModalOpen} onOpenChange={setAlertModalOpen}>
        <DialogContent className="max-h-[80vh] w-[90vw] max-w-2xl overflow-auto p-6 bg-white rounded-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-2">
              Alertas del paciente
            </DialogTitle>
          </DialogHeader>
          {alertasLoading && <div>Cargando alertas...</div>}
          {alertasError && <div className="text-destructive">{alertasError}</div>}
          {!alertasLoading && !alertasError && (
            <>
              {alertas.length === 0 ? (
                <div className="text-sm">No hay alertas para este paciente.</div>
              ) : (
                <>
                  <div className="space-y-3">
                    {alertas.map(alerta => (
                      <div
                        key={alerta.id_medicion}
                        className="border rounded-md p-3 flex flex-col gap-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                        onClick={() => handleClickAlerta(alerta)}
                      >
                        <div className="font-medium">
                          {new Date(alerta.fecha_registro).toLocaleString()} -{' '}
                          <span className="capitalize">{alerta.severidad_max}</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <b>Resumen:</b> {alerta.resumen_alerta}
                        </div>
                        <div className="text-xs text-gray-500">
                          Estado: <span className="capitalize">{alerta.estado_alerta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* PAGINADOR */}
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages} ({totalAlertas} alertas)
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setAlertModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DETALLE DE ALERTA INDIVIDUAL */}
      <Dialog open={detalleAlertaOpen} onOpenChange={setDetalleAlertaOpen}>
        <DialogContent className="max-h-[80vh] w-[90vw] max-w-4xl overflow-hidden p-0 rounded-md shadow-xl">
          <div className="flex flex-col sm:flex-row gap-0">
            {/* Columna izquierda - Alerta */}
            <div className="w-full sm:w-1/2 lg:w-7/12 sm:border-r bg-muted/20">
              <ScrollArea className="max-h-[72vh] sm:max-h-[75vh]">
                <div className="px-6 py-5 space-y-5">
                  <div className="space-y-1">
                    <h4 className="font-semibold leading-tight">
                      Alerta #{alertaSeleccionada?.id_medicion}
                    </h4>
                    <p className="text-sm text-muted-foreground">{alertaSeleccionada?.resumen_alerta}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">Disparó la alerta:</span>
                    {alertaSeleccionada?.severidad_max ? (
                      <Badge variant="outline" className="text-xs capitalize">
                        {alertaSeleccionada.severidad_max}
                      </Badge>
                    ) : (
                      <span>—</span>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <h5 className="font-medium text-sm">Registros de esta medición</h5>
                      {loadingDetalles && <span className="text-xs text-muted-foreground">Cargando…</span>}
                    </div>
                    {detalles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {detalles.map(d => renderDetalleRow(d))}
                      </div>
                    ) : (
                      !loadingDetalles && (
                        <p className="text-sm text-muted-foreground">No hay detalles para esta medición.</p>
                      )
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Columna derecha - Info adicional (opcional) */}
            <div className="w-full sm:w-1/2 lg:w-5/12 bg-white">
              <ScrollArea className="max-h-[72vh] sm:max-h-[75vh]">
                <div className="px-6 py-5 space-y-4">
                  <h5 className="font-semibold text-sm">Información adicional</h5>
                  {alertaSeleccionada && (
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Origen:</span> {alertaSeleccionada.origen}
                      </div>
                      <div>
                        <span className="font-medium">Registrado por:</span> {alertaSeleccionada.registrado_por}
                      </div>
                      <div>
                        <span className="font-medium">Fecha registro:</span>{' '}
                        {new Date(alertaSeleccionada.fecha_registro).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span>{' '}
                        <span className="capitalize">{alertaSeleccionada.estado_alerta}</span>
                      </div>
                      <Separator />
                      <div>
                        <span className="font-medium">Observación:</span>
                        <p className="text-muted-foreground mt-1">{alertaSeleccionada.observacion || 'Sin observaciones.'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-3 border-t bg-white">
            <Button variant="outline" onClick={() => setDetalleAlertaOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ----------- FUNCIONES AUXILIARES ----------
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

// ----------- COMPONENTE PRINCIPAL ----------
export default function DoctorPatients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [patients, setPatients] = useState<PacienteOut[]>([]);
  const [comunas, setComunas] = useState<ComunaOut[]>([]);
  const [cesfams, setCesfams] = useState<CesfamOut[]>([]);
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

    // cargar comunas
    listComunas({ page_size: 5000 }).then((res) => {
      if (res.ok) setComunas(res.data.items);
      else setComunas([]);
    });
    // cargar cesfams
    listCesfam({ page_size: 5000 }).then((res) => {
      if (res.ok) setCesfams(res.data.items);
      else setCesfams([]);
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
                    <DialogHandle paciente={patient} comunas={comunas} cesfams={cesfams}>
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

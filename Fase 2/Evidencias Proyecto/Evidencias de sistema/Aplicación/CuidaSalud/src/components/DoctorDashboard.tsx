import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, AlertTriangle, TrendingUp, FileText, Search, Filter, Download } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { getPacientes } from '../services/paciente'; // Cambia según corresponda


interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}


interface PacienteOut {
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


interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}


const chartData = [
  { date: '2024-01-15', bloodSugar: 120, bloodPressure: 140, temperature: 98.6 },
  { date: '2024-01-16', bloodSugar: 135, bloodPressure: 145, temperature: 99.1 },
  { date: '2024-01-17', bloodSugar: 110, bloodPressure: 138, temperature: 98.4 },
  { date: '2024-01-18', bloodSugar: 125, bloodPressure: 142, temperature: 98.8 },
  { date: '2024-01-19', bloodSugar: 140, bloodPressure: 150, temperature: 99.2 },
  { date: '2024-01-20', bloodSugar: 118, bloodPressure: 136, temperature: 98.5 },
];


const alertData = [
  { type: 'Critical', count: 5, color: '#ef4444' },
  { type: 'Warning', count: 12, color: '#f59e0b' },
  { type: 'Normal', count: 28, color: '#10b981' },
];


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


export function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [patients, setPatients] = useState<PacienteOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PacienteOut | null>(null);

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
      .catch((err) => {
        setError(err.message || 'Error cargando pacientes');
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

  const filteredPatients = patients.filter((patient) => {
    const nombreCompleto = `${patient.primer_nombre_paciente} ${patient.segundo_nombre_paciente ?? ''} ${patient.primer_apellido_paciente} ${patient.segundo_apellido_paciente}`;
    const matchesSearch = nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase());
    const risk = mapRiskLevel(patient);
    const matchesRisk = filterRisk === 'all' || risk === filterRisk;
    return matchesSearch && matchesRisk;
  });

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

  const sidebarContent = (
    <nav className="space-y-2">
      <Button variant="default" className="w-full justify-start">
        <Users className="h-4 w-4 mr-2" />
        Pacientes
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <AlertTriangle className="h-4 w-4 mr-2" />
        Alertas
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <TrendingUp className="h-4 w-4 mr-2" />
        Analítica
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <FileText className="h-4 w-4 mr-2" />
        Reportes
      </Button>
    </nav>
  );

  return (
    <DashboardLayout user={user} onLogout={onLogout} sidebarContent={sidebarContent} notifications={8}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Dashboard de Médico</h2>
          <p className="text-gray-600">Monitorea pacientes, revisa alertas y gestiona protocolos de cuidado</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">+2 desde la semana pasada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas críticas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">5</div>
              <p className="text-xs text-muted-foreground">Requiere atención inmediata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes de alto riesgo</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.filter((p) => mapRiskLevel(p) === 'high').length}</div>
              <p className="text-xs text-muted-foreground">
                {patients.length
                  ? ((patients.filter((p) => mapRiskLevel(p) === 'high').length / patients.length) * 100).toFixed(0)
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reportes generados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="patients">Gestión de pacientes</TabsTrigger>
            <TabsTrigger value="analytics">Analítica</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPatient(patient)}
                            >
                              Ver detalles
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencias de pacientes (30 días)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="bloodSugar" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="bloodPressure" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de alertas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={alertData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count">
                        {alertData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generar reportes</CardTitle>
                <CardDescription>Crear reportes detallados para análisis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo reporte</label>
                    <Select defaultValue="patient">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Resumen Pacientes</SelectItem>
                        <SelectItem value="alerts">Análisis de alertas</SelectItem>
                        <SelectItem value="trends">Reporte de tendencias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rango de fechas</label>
                    <Select defaultValue="30days">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Últimos 7 días</SelectItem>
                        <SelectItem value="30days">Últimos 30 días</SelectItem>
                        <SelectItem value="90days">Últimos 90 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Formato</label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full md:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Generar reporte
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reportes recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Reporte Resumen Pacientes - Enero 2024', date: '2024-01-20', format: 'PDF' },
                    { name: 'Análisis de alertas - Semana 3', date: '2024-01-18', format: 'Excel' },
                    { name: 'Tendencias - Q1 2024', date: '2024-01-15', format: 'PDF' },
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-gray-600">
                          {report.date} • {report.format}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal detalles paciente */}
        <Dialog.Root open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 animate-fadeIn" />
            <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg focus:outline-none animate-slideIn overflow-auto">
              {selectedPatient && (
                <>
                  <Dialog.Title className="text-2xl font-bold mb-4">
                    {selectedPatient.primer_nombre_paciente} {selectedPatient.segundo_nombre_paciente} {selectedPatient.primer_apellido_paciente} {selectedPatient.segundo_apellido_paciente}
                  </Dialog.Title>
                  <Dialog.Description className="mb-6 text-gray-700">Detalles completos del paciente.</Dialog.Description>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <strong>RUT:</strong> {selectedPatient.rut_paciente}
                    </div>
                    <div>
                      <strong>Comuna:</strong> {selectedPatient.id_comuna}
                    </div>
                    <div>
                      <strong>Edad:</strong> {calculateAge(selectedPatient.fecha_nacimiento)}
                    </div>
                    <div>
                      <strong>Sexo:</strong> {selectedPatient.sexo ? 'Masculino' : 'Femenino'}
                    </div>
                    <div>
                      <strong>Tipo de Sangre:</strong> {selectedPatient.tipo_de_sangre}
                    </div>
                    <div>
                      <strong>Seguro:</strong> {selectedPatient.seguro}
                    </div>
                    <div className="col-span-2">
                      <strong>Dirección:</strong> {selectedPatient.direccion}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {selectedPatient.telefono}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedPatient.email}
                    </div>
                    <div className="col-span-2">
                      <strong>Enfermedades:</strong> {selectedPatient.enfermedades}
                    </div>
                    <div>
                      <strong>Tipo Paciente:</strong> {selectedPatient.tipo_paciente}
                    </div>
                    <div>
                      <strong>Contacto:</strong> {selectedPatient.nombre_contacto}
                    </div>
                    <div>
                      <strong>Teléfono Contacto:</strong> {selectedPatient.telefono_contacto}
                    </div>
                    <div>
                      <strong>Estado:</strong> {selectedPatient.estado ? 'Activo' : 'Inactivo'}
                    </div>
                    <div>
                      <strong>Activo Cesfam:</strong> {selectedPatient.activo_cesfam ? 'Sí' : 'No'}
                    </div>
                    <div>
                      <strong>Inicio Cesfam:</strong> {new Date(selectedPatient.fecha_inicio_cesfam).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Fin Cesfam:</strong>{' '}
                      {selectedPatient.fecha_fin_cesfam ? new Date(selectedPatient.fecha_fin_cesfam).toLocaleDateString() : '-'}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Dialog.Close asChild>
                      <Button variant="outline" size="sm">
                        <X className="mr-2 h-4 w-4" />
                        Cerrar
                      </Button>
                    </Dialog.Close>
                  </div>
                </>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </DashboardLayout>
  );
}

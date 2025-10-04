import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  Phone, 
  Calendar, 
  Activity,
  Heart,
  Thermometer,
  Stethoscope,
  CheckCircle,
  XCircle,
  PlayCircle,
  Bell,
  BellRing,
  Eye,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  diagnosis: string;
  lastContact: string;
  riskLevel: 'alto' | 'medio' | 'bajo';
  avatar?: string;
}

interface Alert {
  id: string;
  patientId: string;
  type: 'vital_signs' | 'symptoms' | 'medication' | 'emergency' | 'lab_results';
  title: string;
  description: string;
  priority: 'crítica' | 'alta' | 'media' | 'baja';
  status: 'nueva' | 'en_proceso' | 'resuelta' | 'ignorada';
  timestamp: Date;
  values?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    glucose?: number;
    oxygen?: number;
  };
  assignedTo?: string;
}

// Datos simulados
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'María García López',
    age: 68,
    gender: 'F',
    phone: '+57 300 123 4567',
    diagnosis: 'Hipertensión Arterial + Diabetes Mellitus',
    lastContact: '2024-01-15',
    riskLevel: 'alto'
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    age: 45,
    gender: 'M',
    phone: '+57 311 987 6543',
    diagnosis: 'Enfermedad Cardiovascular',
    lastContact: '2024-01-14',
    riskLevel: 'alto'
  },
  {
    id: '3',
    name: 'Ana Martínez',
    age: 34,
    gender: 'F',
    phone: '+57 320 555 7890',
    diagnosis: 'Asma Bronquial',
    lastContact: '2024-01-16',
    riskLevel: 'medio'
  },
  {
    id: '4',
    name: 'Roberto Silva',
    age: 72,
    gender: 'M',
    phone: '+57 315 444 2222',
    diagnosis: 'EPOC + Hipertensión',
    lastContact: '2024-01-13',
    riskLevel: 'alto'
  },
  {
    id: '5',
    name: 'Laura Jiménez',
    age: 29,
    gender: 'F',
    phone: '+57 301 333 1111',
    diagnosis: 'Hipotiroidismo',
    lastContact: '2024-01-16',
    riskLevel: 'bajo'
  }
];

const generateMockAlerts = (): Alert[] => [
  {
    id: '1',
    patientId: '1',
    type: 'vital_signs',
    title: 'Presión Arterial Elevada',
    description: 'Presión arterial sistólica > 180 mmHg registrada durante automonitoreo',
    priority: 'crítica',
    status: 'nueva',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    values: { bloodPressure: '185/95', heartRate: 88 }
  },
  {
    id: '2',
    patientId: '2',
    type: 'symptoms',
    title: 'Dolor Torácico',
    description: 'Paciente reporta dolor en el pecho de intensidad 7/10, irradiado al brazo izquierdo',
    priority: 'crítica',
    status: 'en_proceso',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    assignedTo: 'Dr. Médico'
  },
  {
    id: '3',
    patientId: '3',
    type: 'medication',
    title: 'Falta de Adherencia',
    description: 'No ha tomado el inhalador de rescate en las últimas 48 horas según reporte',
    priority: 'alta',
    status: 'nueva',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '4',
    patientId: '4',
    type: 'vital_signs',
    title: 'Saturación de Oxígeno Baja',
    description: 'SpO2 89% en reposo, por debajo del rango objetivo',
    priority: 'alta',
    status: 'nueva',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    values: { oxygen: 89, heartRate: 95 }
  },
  {
    id: '5',
    patientId: '1',
    type: 'lab_results',
    title: 'Glucosa Elevada',
    description: 'Glucosa en ayunas 280 mg/dL - Requiere ajuste terapéutico inmediato',
    priority: 'alta',
    status: 'nueva',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    values: { glucose: 280 }
  },
  {
    id: '6',
    patientId: '5',
    type: 'symptoms',
    title: 'Fatiga Extrema',
    description: 'Reporta cansancio extremo y somnolencia desde hace 3 días',
    priority: 'media',
    status: 'nueva',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '7',
    patientId: '2',
    type: 'vital_signs',
    title: 'Frecuencia Cardíaca Irregular',
    description: 'Arritmia detectada durante monitoreo automático',
    priority: 'alta',
    status: 'resuelta',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    values: { heartRate: 45 },
    assignedTo: 'Dr. Médico'
  }
];

export default function MedicalDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>(generateMockAlerts());
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [patients] = useState<Patient[]>(mockPatients);
  const [filter, setFilter] = useState<'todas' | 'nuevas' | 'proceso' | 'críticas'>('todas');

  // Simular nuevas alertas cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% probabilidad
        const newAlert: Alert = {
          id: Date.now().toString(),
          patientId: patients[Math.floor(Math.random() * patients.length)].id,
          type: ['vital_signs', 'symptoms', 'medication'][Math.floor(Math.random() * 3)] as any,
          title: ['Presión Arterial Elevada', 'Síntomas Nuevos', 'Medicación Pendiente'][Math.floor(Math.random() * 3)],
          description: 'Nueva alerta generada automáticamente',
          priority: ['alta', 'media'][Math.floor(Math.random() * 2)] as any,
          status: 'nueva',
          timestamp: new Date()
        };
        
        setAlerts(prev => [newAlert, ...prev]);
        toast.info('Nueva alerta recibida', {
          description: `${getPatientById(newAlert.patientId)?.name}: ${newAlert.title}`
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [patients]);

  const getPatientById = (id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'nuevas': return alert.status === 'nueva';
      case 'proceso': return alert.status === 'en_proceso';
      case 'críticas': return alert.priority === 'crítica';
      default: return alert.status !== 'ignorada';
    }
  });

  const handleTakeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'en_proceso', assignedTo: 'Dr. Médico' }
        : alert
    ));
    toast.success('Alerta tomada');
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resuelta' }
        : alert
    ));
    toast.success('Alerta resuelta');
    setSelectedAlert(null);
  };

  const handleIgnoreAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'ignorada' }
        : alert
    ));
    toast.info('Alerta ignorada');
    setSelectedAlert(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'crítica': return 'destructive';
      case 'alta': return 'secondary';
      case 'media': return 'outline';
      case 'baja': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nueva': return 'destructive';
      case 'en_proceso': return 'secondary';
      case 'resuelta': return 'outline';
      case 'ignorada': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nueva': return <Bell className="h-4 w-4" />;
      case 'en_proceso': return <PlayCircle className="h-4 w-4" />;
      case 'resuelta': return <CheckCircle className="h-4 w-4" />;
      case 'ignorada': return <XCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vital_signs': return <Activity className="h-4 w-4" />;
      case 'symptoms': return <AlertCircle className="h-4 w-4" />;
      case 'medication': return <Heart className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'lab_results': return <Stethoscope className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const criticalCount = alerts.filter(a => a.priority === 'crítica' && a.status !== 'resuelta' && a.status !== 'ignorada').length;
  const newCount = alerts.filter(a => a.status === 'nueva').length;
  const inProcessCount = alerts.filter(a => a.status === 'en_proceso').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel de Alertas */}
      <div className="lg:col-span-2 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium">Críticas</p>
                  <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BellRing className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Nuevas</p>
                  <p className="text-2xl font-bold text-orange-500">{newCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <PlayCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">En Proceso</p>
                  <p className="text-2xl font-bold text-blue-500">{inProcessCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Pacientes</p>
                  <p className="text-2xl font-bold text-green-500">{patients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas Activas
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'todas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('todas')}
                >
                  Todas
                </Button>
                <Button
                  variant={filter === 'críticas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('críticas')}
                >
                  Críticas
                </Button>
                <Button
                  variant={filter === 'nuevas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('nuevas')}
                >
                  Nuevas
                </Button>
                <Button
                  variant={filter === 'proceso' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('proceso')}
                >
                  En Proceso
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const patient = getPatientById(alert.patientId);
                  if (!patient) return null;

                  return (
                    <Card 
                      key={alert.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAlert?.id === alert.id ? 'ring-2 ring-primary' : ''
                      } ${alert.priority === 'crítica' ? 'border-destructive' : ''}`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between space-x-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0">
                              {getTypeIcon(alert.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm truncate">{patient.name}</p>
                                <Badge variant={getPriorityColor(alert.priority)} className="text-xs">
                                  {alert.priority}
                                </Badge>
                                <Badge variant={getStatusColor(alert.status)} className="text-xs">
                                  {getStatusIcon(alert.status)}
                                  {alert.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="font-medium text-sm mb-1">{alert.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {alert.description}
                              </p>
                              {alert.values && (
                                <div className="flex gap-4 mt-2 text-xs">
                                  {alert.values.bloodPressure && (
                                    <span className="flex items-center gap-1">
                                      <Activity className="h-3 w-3" />
                                      {alert.values.bloodPressure}
                                    </span>
                                  )}
                                  {alert.values.heartRate && (
                                    <span className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      {alert.values.heartRate} lpm
                                    </span>
                                  )}
                                  {alert.values.temperature && (
                                    <span className="flex items-center gap-1">
                                      <Thermometer className="h-3 w-3" />
                                      {alert.values.temperature}°C
                                    </span>
                                  )}
                                  {alert.values.glucose && (
                                    <span className="flex items-center gap-1">
                                      <Activity className="h-3 w-3" />
                                      {alert.values.glucose} mg/dL
                                    </span>
                                  )}
                                  {alert.values.oxygen && (
                                    <span className="flex items-center gap-1">
                                      <Activity className="h-3 w-3" />
                                      SpO2 {alert.values.oxygen}%
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(alert.timestamp)}
                            </div>
                            {alert.status === 'nueva' && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTakeAlert(alert.id);
                                }}
                              >
                                Tomar
                              </Button>
                            )}
                            {alert.status === 'en_proceso' && alert.assignedTo && (
                              <Badge variant="secondary" className="text-xs">
                                {alert.assignedTo}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No hay alertas para el filtro seleccionado</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Panel de Detalles */}
      <div className="space-y-4">
        {selectedAlert ? (
          <>
            {/* Detalles de la Alerta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Detalles de la Alerta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(selectedAlert.priority)}>
                    {selectedAlert.priority}
                  </Badge>
                  <Badge variant={getStatusColor(selectedAlert.status)}>
                    {getStatusIcon(selectedAlert.status)}
                    {selectedAlert.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">{selectedAlert.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAlert.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {selectedAlert.timestamp.toLocaleString('es-ES')}
                </div>

                {selectedAlert.values && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Valores Registrados:</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedAlert.values).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAlert.assignedTo && (
                  <div>
                    <span className="text-sm text-muted-foreground">Asignado a: </span>
                    <span className="font-medium">{selectedAlert.assignedTo}</span>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  {selectedAlert.status === 'nueva' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleTakeAlert(selectedAlert.id)}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Tomar Alerta
                    </Button>
                  )}
                  
                  {(selectedAlert.status === 'en_proceso' || selectedAlert.status === 'nueva') && (
                    <>
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => handleResolveAlert(selectedAlert.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Resolver
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleIgnoreAlert(selectedAlert.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Ignorar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información del Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const patient = getPatientById(selectedAlert.patientId);
                  if (!patient) return <p>Paciente no encontrado</p>;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={patient.avatar} />
                          <AvatarFallback>
                            {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.age} años, {patient.gender === 'M' ? 'Masculino' : 'Femenino'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          <span>{patient.diagnosis}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Último contacto: {new Date(patient.lastContact).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <Badge variant={patient.riskLevel === 'alto' ? 'destructive' : patient.riskLevel === 'medio' ? 'secondary' : 'outline'}>
                            Riesgo {patient.riskLevel}
                          </Badge>
                        </div>
                      </div>

                      <Button className="w-full" variant="outline">
                        <Phone className="mr-2 h-4 w-4" />
                        Llamar Paciente
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Eye className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Selecciona una alerta para ver los detalles</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
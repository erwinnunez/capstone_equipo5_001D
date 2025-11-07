import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Activity, Bell, AlertTriangle, TrendingDown, Clock, User } from "lucide-react";
import { listPacienteCuidador } from "../../services/pacienteCuidador";
import { listarMediciones } from "../../services/medicion";

type NotificationType = "critical" | "warning" | "info" | "measurement";

interface MeasurementNotification {
  id: string;
  type: NotificationType;
  message: string;
  time: string;
  patientName: string;
  patientRut: string;
  measurementType: string;
  value?: string;
  severity?: string;
  isOutOfRange?: boolean;
}

interface CuidadorNotificacionesProps {
  cuidadorId?: string;
}

type Variant = "default" | "secondary" | "destructive" | "outline";

const getNotificationColor = (type: NotificationType): Variant => {
  switch (type) {
    case "critical":
      return "destructive";
    case "warning":
      return "secondary";
    case "measurement":
      return "default";
    case "info":
    default:
      return "outline";
  }
};

const typeLabel = (type: NotificationType) => {
  switch (type) {
    case "critical":
      return "Crítica";
    case "warning":
      return "Advertencia";
    case "measurement":
      return "Medición";
    case "info":
    default:
      return "Información";
  }
};

const getNotificationIcon = (type: NotificationType, isOutOfRange?: boolean) => {
  switch (type) {
    case "critical":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <Bell className="h-5 w-5 text-yellow-500" />;
    case "measurement":
      if (isOutOfRange) {
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      }
      return <Activity className="h-5 w-5 text-blue-500" />;
    case "info":
    default:
      return <Activity className="h-5 w-5 text-blue-500" />;
  }
};

export default function CuidadorNotificaciones({ cuidadorId }: CuidadorNotificacionesProps = {}) {
  const [notifications, setNotifications] = useState<MeasurementNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las últimas mediciones de los pacientes del cuidador
  const fetchPatientMeasurements = async () => {
    if (!cuidadorId) {
      setError("No se proporcionó ID del cuidador");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Obtener pacientes asociados al cuidador
      const patientsResult = await listPacienteCuidador({
        rut_cuidador: cuidadorId,
        activo: true,
        page: 1,
        page_size: 50
      });

      if (patientsResult.items.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // 2. Obtener mediciones recientes (últimos 7 días)
      const measurementsResult = await listarMediciones(1, 100);
      
      if (!measurementsResult.ok) {
        setError("Error al obtener mediciones");
        setLoading(false);
        return;
      }

      // 3. Filtrar mediciones de los pacientes del cuidador y últimos 7 días
      const patientRuts = patientsResult.items.map(p => p.rut_paciente);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentMeasurements = measurementsResult.data.items.filter(measurement => 
        patientRuts.includes(measurement.rut_paciente) &&
        new Date(measurement.fecha_registro) >= sevenDaysAgo
      );

      // 4. Convertir mediciones a notificaciones
      const measurementNotifications: MeasurementNotification[] = recentMeasurements
        .sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())
        .slice(0, 10) // Mostrar solo las 10 más recientes
        .map((measurement, index) => {
          const date = new Date(measurement.fecha_registro);
          const timeAgo = getTimeAgo(date);
          
          let notificationType: NotificationType = "measurement";
          let message = "";

          if (measurement.tiene_alerta) {
            notificationType = measurement.severidad_max === "critica" ? "critical" : "warning";
            message = `${measurement.resumen_alerta} - Paciente: ${measurement.rut_paciente}`;
          } else {
            message = `Nueva medición registrada - Paciente: ${measurement.rut_paciente}`;
          }

          return {
            id: `measurement-${measurement.id_medicion}-${index}`,
            type: notificationType,
            message,
            time: timeAgo,
            patientName: measurement.rut_paciente, // Podrías obtener el nombre real del paciente si tienes el servicio
            patientRut: measurement.rut_paciente,
            measurementType: measurement.origen,
            value: measurement.observacion,
            severity: measurement.severidad_max,
            isOutOfRange: measurement.tiene_alerta
          };
        });

      setNotifications(measurementNotifications);
    } catch (err: any) {
      console.error("Error al cargar notificaciones:", err);
      setError("Error al cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular tiempo transcurrido
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInMinutes > 0) {
      return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else {
      return 'hace un momento';
    }
  };

  useEffect(() => {
    // Solo intentar cargar si tenemos ID del cuidador
    if (cuidadorId) {
      fetchPatientMeasurements();
    } else {
      setError("ID del cuidador no proporcionado");
      setLoading(false);
    }
  }, [cuidadorId]);

  // Si no hay ID del cuidador, mostrar mensaje de error
  if (!cuidadorId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Centro de Notificaciones
          </CardTitle>
          <CardDescription>Últimas mediciones de tus pacientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">Error: ID del cuidador no proporcionado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Centro de Notificaciones
          </CardTitle>
          <CardDescription>Últimas mediciones de tus pacientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Cargando notificaciones...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Centro de Notificaciones
        </CardTitle>
        <CardDescription>
          Últimas mediciones y alertas de tus pacientes ({notifications.length} notificaciones)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Sin notificaciones recientes</h3>
            <p className="text-muted-foreground">
              No hay mediciones recientes de tus pacientes en los últimos 7 días.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type, notification.isOutOfRange)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={getNotificationColor(notification.type)}>
                      {typeLabel(notification.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-sm font-medium mb-1">{notification.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>RUT: {notification.patientRut}</span>
                    {notification.measurementType && (
                      <>
                        <span>•</span>
                        <span>Origen: {notification.measurementType}</span>
                      </>
                    )}
                    {notification.severity && notification.isOutOfRange && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          Severidad: {notification.severity}
                        </Badge>
                      </>
                    )}
                  </div>
                  {notification.value && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Observación: {notification.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

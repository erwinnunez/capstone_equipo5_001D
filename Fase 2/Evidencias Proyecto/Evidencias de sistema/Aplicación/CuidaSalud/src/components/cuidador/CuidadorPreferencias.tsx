import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";

export default function CuidadorPreferencias() {
  const [notificationSettings, setNotificationSettings] = useState({
    criticalAlerts: true,
    medicationReminders: true,
    appointmentReminders: true,
    dailyReports: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias de notificación</CardTitle>
        <CardDescription>Configura qué alertas y notificaciones deseas recibir</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Alertas críticas</h4>
            <p className="text-sm text-gray-600">Notificaciones inmediatas por condiciones críticas del paciente</p>
          </div>
          <Switch
            checked={notificationSettings.criticalAlerts}
            onCheckedChange={(checked: boolean) =>
              setNotificationSettings({ ...notificationSettings, criticalAlerts: checked })
            }
            aria-label="Activar alertas críticas"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Recordatorios de medicación</h4>
            <p className="text-sm text-gray-600">Alertas cuando los pacientes omiten medicación</p>
          </div>
          <Switch
            checked={notificationSettings.medicationReminders}
            onCheckedChange={(checked: boolean) =>
              setNotificationSettings({ ...notificationSettings, medicationReminders: checked })
            }
            aria-label="Activar recordatorios de medicación"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Recordatorios de citas</h4>
            <p className="text-sm text-gray-600">Notificaciones de próximas citas</p>
          </div>
          <Switch
            checked={notificationSettings.appointmentReminders}
            onCheckedChange={(checked: boolean) =>
              setNotificationSettings({ ...notificationSettings, appointmentReminders: checked })
            }
            aria-label="Activar recordatorios de citas"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Reportes diarios</h4>
            <p className="text-sm text-gray-600">Resumen diario de actividades del paciente</p>
          </div>
          <Switch
            checked={notificationSettings.dailyReports}
            onCheckedChange={(checked: boolean) =>
              setNotificationSettings({ ...notificationSettings, dailyReports: checked })
            }
            aria-label="Activar reportes diarios"
          />
        </div>

        <Button className="w-full mt-4">Guardar preferencias</Button>
      </CardContent>
    </Card>
  );
}

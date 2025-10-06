import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Activity, Bell, AlertTriangle } from "lucide-react";
import { notifications } from "../../data/cuidadorMock.ts";
import type { CareNotification } from "../../data/cuidadorMock.ts";

type Variant = "default" | "secondary" | "destructive" | "outline";
const getNotificationColor = (t: string): Variant =>
  t === "critical" ? "destructive" : t === "warning" ? "secondary" : "outline";

// Etiqueta visible en español (sin tocar los valores internos)
const typeLabel = (t: string) => {
  switch (t) {
    case "critical":
      return "Crítica";
    case "warning":
      return "Advertencia";
    case "info":
      return "Información";
    default:
      return t;
  }
};

export default function CuidadorNotificaciones() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Centro de notificaciones</CardTitle>
        <CardDescription>Mantente al día con alertas y eventos importantes de tus pacientes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((n: CareNotification) => (
            <div key={n.id} className="flex items-start space-x-3 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                {n.type === "critical" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                {n.type === "warning" && <Bell className="h-5 w-5 text-yellow-500" />}
                {n.type === "info" && <Activity className="h-5 w-5 text-blue-500" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Badge variant={getNotificationColor(n.type)}>{typeLabel(n.type)}</Badge>
                  <span className="text-xs text-gray-500">{n.time}</span>
                </div>
                <p className="text-sm mt-1">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

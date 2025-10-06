// src/components/admin/AdminSettings.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function AdminSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del sistema</CardTitle>
        <CardDescription>Configura ajustes globales y políticas de seguridad</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Autenticación de dos factores</h4>
              <p className="text-sm text-gray-600">Requerir 2FA para todas las cuentas de administrador</p>
            </div>
            <Switch defaultChecked aria-label="Activar autenticación de dos factores" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Tiempo de inactividad de sesión</h4>
              <p className="text-sm text-gray-600">Cerrar sesión automáticamente tras inactividad</p>
            </div>
            <Select defaultValue="30">
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Respaldo de datos</h4>
              <p className="text-sm text-gray-600">Respaldos automáticos del sistema</p>
            </div>
            <Select defaultValue="daily">
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Cada hora</SelectItem>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Registro de auditoría</h4>
              <p className="text-sm text-gray-600">Registrar todas las actividades del sistema</p>
            </div>
            <Switch defaultChecked aria-label="Activar registro de auditoría" />
          </div>
        </div>

        <Button className="w-full">Guardar configuración</Button>
      </CardContent>
    </Card>
  );
}

// src/components/admin/AdminOverview.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Heart, UserCheck, Stethoscope, TrendingUp, Activity, AlertTriangle } from "lucide-react";
import { getTotalPacientes } from '../../services/paciente';
import { getTotalMedicos } from '../../services/equipoMedico';
import { getTotalCuidadores } from '../../services/cuidador';

export default function AdminOverview() {
  const [totals, setTotals] = useState({
    pacientes: 0,
    medicos: 0,
    cuidadores: 0,
    loading: true
  });

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [totalPacientes, totalMedicos, totalCuidadores] = await Promise.all([
          getTotalPacientes(),
          getTotalMedicos(),
          getTotalCuidadores()
        ]);

        setTotals({
          pacientes: totalPacientes,
          medicos: totalMedicos,
          cuidadores: totalCuidadores,
          loading: false
        });
      } catch (error) {
        console.error('Error al cargar totales:', error);
        setTotals(prev => ({ ...prev, loading: false }));
      }
    };

    fetchTotals();
  }, []);
  return (
    <div className="space-y-6">
      {/* Primera fila - Totales de usuarios registrados */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Usuarios Registrados en el Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totals.loading ? '...' : totals.pacientes.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Médicos</CardTitle>
              <Stethoscope className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totals.loading ? '...' : totals.medicos.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Profesionales registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cuidadores</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totals.loading ? '...' : totals.cuidadores.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Cuidadores registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Logins Hoy</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">Pacientes conectados hoy</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Segunda fila - Actividad médica */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Actividad Médica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevas Mediciones</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">Registradas hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Médicas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">7</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tercera fila - Resumen de registros recientes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Registros Recientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Nuevos Registros Esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pacientes nuevos</span>
                  <span className="text-lg font-semibold text-red-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Médicos registrados</span>
                  <span className="text-lg font-semibold text-blue-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cuidadores nuevos</span>
                  <span className="text-lg font-semibold text-green-600">8</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-medium">Total registros</span>
                  <span className="text-lg font-bold">23</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Actividad de Mediciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Presión arterial</span>
                  <span className="text-lg font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Peso corporal</span>
                  <span className="text-lg font-semibold">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Glucosa</span>
                  <span className="text-lg font-semibold">32</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-medium">Total hoy</span>
                  <span className="text-lg font-bold">166</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

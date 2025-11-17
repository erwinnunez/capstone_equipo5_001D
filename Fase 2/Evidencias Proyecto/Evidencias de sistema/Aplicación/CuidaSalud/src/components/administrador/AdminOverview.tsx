// src/components/admin/AdminOverview.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Heart, UserCheck, Stethoscope, TrendingUp, Activity, AlertTriangle } from "lucide-react";
import { getTotalPacientes } from '../../services/paciente';
import { listarMediciones, listarMedicionesConAlerta } from '../../services/medicion';
// import { getPacientes } from '../../services/paciente';
// import { getGamificacionPerfil } from '../../services/gamificacion';
import { listarGamificacionPerfiles } from '../../services/gamificacion';
import { getTotalMedicos } from '../../services/equipoMedico';
import { getTotalCuidadores } from '../../services/cuidador';

export default function AdminOverview() {
  const [medicionesHoy, setMedicionesHoy] = useState<number | null>(null);
  const [alertasHoy, setAlertasHoy] = useState<number | null>(null);

  const [totals, setTotals] = useState({
    pacientes: 0,
    medicos: 0,
    cuidadores: 0,
    loading: true
  });
  const [loginsHoy, setLoginsHoy] = useState<number | null>(null);

  useEffect(() => {
  const fetchTotalsAndLogins = async () => {
      // Obtener mediciones registradas hoy
      try {
        const hoy = new Date().toISOString().slice(0, 10);
        const medicionesRes = await listarMediciones(1, 200);
        if (medicionesRes.ok) {
          const medicionesHoyCount = medicionesRes.data.items.filter(m => m.fecha_registro.slice(0, 10) === hoy).length;
          setMedicionesHoy(medicionesHoyCount);
        } else {
          setMedicionesHoy(null);
        }
        // Obtener alertas médicas hoy
        const alertasRes = await listarMedicionesConAlerta(1, 200);
        if (alertasRes.ok) {
          const alertasHoyCount = alertasRes.data.items.filter(a => a.fecha_registro.slice(0, 10) === hoy).length;
          setAlertasHoy(alertasHoyCount);
        } else {
          setAlertasHoy(null);
        }
      } catch (e) {
        setMedicionesHoy(null);
        setAlertasHoy(null);
      }
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

        // Obtener todos los perfiles de gamificación y contar los logins de hoy
        const today = new Date().toISOString().slice(0, 10);
        let loginsCount = 0;
        let page = 1;
        let pageSize = 50;
        let totalPages = 1;
        do {
          const perfilesRes = await listarGamificacionPerfiles(page, pageSize);
          if (perfilesRes.items) {
            loginsCount += perfilesRes.items.filter(perfil => perfil.ultima_actividad && perfil.ultima_actividad.slice(0, 10) === today).length;
            totalPages = Math.ceil(perfilesRes.total / pageSize);
            page++;
          } else {
            break;
          }
        } while (page <= totalPages);
        setLoginsHoy(loginsCount);
      } catch (error) {
        console.error('Error al cargar totales o logins hoy:', error);
        setTotals(prev => ({ ...prev, loading: false }));
        setLoginsHoy(null);
      }
    };
    fetchTotalsAndLogins();
  }, []);
  return (
    <div className="space-y-6">
      {/* Primera fila - Totales de usuarios registrados */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Usuarios Registrados en el Sistema</h2>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="bg-white shadow-lg border-2 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Total Pacientes</CardTitle>
              <Heart className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-center text-red-700">
                {totals.loading ? '...' : totals.pacientes.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">Registrados en el sistema</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-2 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Total Médicos</CardTitle>
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-center text-blue-700">
                {totals.loading ? '...' : totals.medicos.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">Profesionales registrados</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-2 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Total Cuidadores</CardTitle>
              <UserCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-center text-green-700">
                {totals.loading ? '...' : totals.cuidadores.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">Cuidadores registrados</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-2 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Logins Hoy</CardTitle>
              <Activity className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-center text-purple-700">
                {loginsHoy === null ? '...' : loginsHoy}
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">Pacientes conectados hoy</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Segunda fila - Actividad médica */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Actividad Médica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg border-2 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Nuevas Mediciones</CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-center text-emerald-700">
                {medicionesHoy === null ? '...' : medicionesHoy}
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">Registradas hoy</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-2 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Alertas Médicas</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-center text-red-700">
                {alertasHoy === null ? '...' : alertasHoy}
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">Requieren atención</p>
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
                  <span className="text-lg font-semibold text-red-600">{totals.loading ? '...' : totals.pacientes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Médicos registrados</span>
                  <span className="text-lg font-semibold text-blue-600">{totals.loading ? '...' : totals.medicos.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cuidadores nuevos</span>
                  <span className="text-lg font-semibold text-green-600">{totals.loading ? '...' : totals.cuidadores.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-medium">Total registros</span>
                  <span className="text-lg font-bold">{totals.loading ? '...' : (totals.pacientes + totals.medicos + totals.cuidadores).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actividad de Mediciones removida por instrucción del usuario */}
        </div>
      </div>
    </div>
  );
}

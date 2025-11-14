// src/components/DoctorReports.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { listPacientes } from '../../services/paciente';
import { listarMedicionesConAlerta, listMedicionDetalles, listarMediciones } from '../../services/medicion';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createSolicitudReporte } from '../../services/solicitudReporte';
import { listSolicitudReportes } from '../../services/solicitudReporte';
// Función robusta para obtener el rut del médico (copiada de MedicalDashboard)
function extractRutFromObject(obj: any): number | null {
  if (!obj) return null;
  const cands = [
    obj?.medico?.rut_medico,
    obj?.rut_medico,
    obj?.rutMedico,
    obj?.rut,
    obj?.user?.rut_medico,
    obj?.user?.rutMedico,
    obj?.user?.rut,
    obj?.user?.id,
    obj?.id,
  ];
  for (const c of cands) {
    if (c != null && !Number.isNaN(Number(c))) return Number(c);
  }
  return null;
}

function getLoggedMedicoRut(): { rut: string | null; source: string } {
  const sessionStr = localStorage.getItem("session");
  if (sessionStr) {
    try {
      const s = JSON.parse(sessionStr);
      const rut = extractRutFromObject(s);
      if (rut != null) return { rut: String(rut), source: "session" };
    } catch {}
  }
  for (const k of ["auth", "user", "current_user", "front_user"]) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      const rut = extractRutFromObject(obj);
      if (rut != null) return { rut: String(rut), source: k };
    } catch {}
  }
  const jwt = localStorage.getItem("token") || localStorage.getItem("jwt");
  if (jwt && jwt.split(".").length === 3) {
    try {
      const payloadJson = atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"));
      const p = JSON.parse(payloadJson);
      const rut =
        p?.rut_medico ??
        p?.rutMedico ??
        p?.sub_rut ??
        p?.subRut ??
        p?.rut ??
        p?.id ??
        null;
      if (rut != null) return { rut: String(rut), source: "jwt" };
    } catch {}
  }
  const direct = localStorage.getItem("medico_rut");
  if (direct) return { rut: String(direct), source: "medico_rut" };
  return { rut: null, source: "none" };
}


export default function DoctorReports() {
      const [currentPage, setCurrentPage] = useState(1);
      const reportsPerPage = 10;
      const [totalReports, setTotalReports] = useState(0);
    // Obtener rut del médico de forma robusta
    const { rut: rutMedico } = getLoggedMedicoRut();
    const [reportType, setReportType] = useState('patient');
    const [dateRange, setDateRange] = useState('30days');
    const [format, setFormat] = useState('excel');
    const [recentReports, setRecentReports] = useState<any[]>([]);

    // Cargar reportes recientes al montar
    useEffect(() => {
      if (!rutMedico) return;
      listSolicitudReportes({ rut_medico: rutMedico, page: currentPage, page_size: reportsPerPage })
        .then((res) => {
          setRecentReports(res.items);
          setTotalReports(res.total ?? 0);
        })
        .catch(() => {
          setRecentReports([]);
          setTotalReports(0);
        });
    }, [rutMedico, currentPage]);

    const handleGenerateReport = async () => {
        // Calcular fechas según el rango seleccionado
        const now = new Date();
        let daysAgo = 30;
        if (dateRange === '7days') daysAgo = 7;
        if (dateRange === '90days') daysAgo = 90;
        const rango_hasta = now.toISOString();
        const desdeDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const rango_desde = desdeDate.toISOString();
        const creado_en = now.toISOString();

        // Crear solicitud de reporte antes de generar el archivo
        try {
          await createSolicitudReporte({
            rut_medico: rutMedico ?? '',
            rango_desde,
            rango_hasta,
            tipo: reportType,
            formato: format,
            estado: 'pendiente',
            creado_en,
          });
        } catch (err: any) {
          alert('Error al registrar la solicitud de reporte: ' + err.message);
          return;
        }
    if (reportType === 'patient' && format === 'excel') {
      // Obtener todos los pacientes
      const pacientesResult = await listPacientes({ page: 1, page_size: 1000 });
      const rows = Array.isArray(pacientesResult?.items)
        ? pacientesResult.items
        : [];
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
      XLSX.writeFile(wb, 'reporte_pacientes.xlsx');
    } else if (reportType === 'alerts' && format === 'excel') {
      // Obtener todas las alertas
      const alertasResult = await listarMedicionesConAlerta(1, 1000);
      let rows: any[] = [];
      if (alertasResult.ok && Array.isArray(alertasResult.data.items)) {
        // Para cada medición, obtener su detalle
        const mediciones = alertasResult.data.items;
        // Usar Promise.all para obtener detalles en paralelo
        const detallesArr = await Promise.all(
          mediciones.map(async (med) => {
            const detallesResult = await listMedicionDetalles({ id_medicion: med.id_medicion, page: 1, page_size: 100 });
            let detalles: import('../../services/medicion').MedicionDetalleOut[] = [];
            if (detallesResult.ok && Array.isArray(detallesResult.data.items)) {
              detalles = detallesResult.data.items;
            }
            // Combinar medición y detalles en un solo objeto por fila
            return detalles.length > 0
              ? detalles.map((det) => ({ ...med, ...det }))
              : [{ ...med }];
          })
        );
        // Flatten array
        rows = detallesArr.flat();
      } else {
        const msg = !alertasResult.ok && 'message' in alertasResult ? alertasResult.message : 'Desconocido';
        alert('Error al obtener alertas: ' + msg);
        return;
      }
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Alertas');
      XLSX.writeFile(wb, 'reporte_alertas.xlsx');
    } else if (reportType === 'trends' && format === 'excel') {
      // Obtener todas las mediciones
      const medicionesResult = await listarMediciones(1, 1000);
      if (!medicionesResult.ok || !Array.isArray(medicionesResult.data.items)) {
        const msg = !medicionesResult.ok && 'message' in medicionesResult ? medicionesResult.message : 'Desconocido';
        alert('Error al obtener mediciones: ' + msg);
        return;
      }
      const mediciones: import('../../services/medicion').MedicionOut[] = medicionesResult.data.items;
      // Agrupar por fecha_registro (solo YYYY-MM-DD)
      type PromedioPorParametro = Record<number, { suma: number; cuenta: number }>;
  type TendenciaPorDia = { fecha: string; cantidad: number; promedios: Record<number, number | undefined> };
      const tendencias: Record<string, TendenciaPorDia> = {};
      const parametrosSet = new Set<number>();
      mediciones.forEach((m: import('../../services/medicion').MedicionOut) => {
        const fecha = m.fecha_registro.slice(0, 10); // YYYY-MM-DD
        if (!tendencias[fecha]) tendencias[fecha] = { fecha, cantidad: 0, promedios: {} };
        tendencias[fecha].cantidad++;
      });
      // Obtener detalles y calcular promedios por parámetro por día
      const fechas = Object.keys(tendencias);
      for (const fecha of fechas) {
        const medicionesDia = mediciones.filter((m: import('../../services/medicion').MedicionOut) => m.fecha_registro.startsWith(fecha));
        const promedioPorParametro: PromedioPorParametro = {};
        for (const med of medicionesDia) {
          const detallesResult = await listMedicionDetalles({ id_medicion: med.id_medicion, page: 1, page_size: 100 });
          if (detallesResult.ok && Array.isArray(detallesResult.data.items)) {
            detallesResult.data.items.forEach((det) => {
              if (typeof det.valor_num === 'number') {
                parametrosSet.add(det.id_parametro);
                if (!promedioPorParametro[det.id_parametro]) promedioPorParametro[det.id_parametro] = { suma: 0, cuenta: 0 };
                promedioPorParametro[det.id_parametro].suma += det.valor_num;
                promedioPorParametro[det.id_parametro].cuenta++;
              }
            });
          }
        }
        // Guardar promedios por parámetro
        Object.entries(promedioPorParametro).forEach(([id_parametro, { suma, cuenta }]) => {
          tendencias[fecha].promedios[Number(id_parametro)] = cuenta > 0 ? suma / cuenta : undefined;
        });
      }
      // Convertir a array para Excel, cada parámetro es una columna
      const parametros = Array.from(parametrosSet).sort((a, b) => a - b);
      // Obtener nombres de parámetros
      let nombresParametros: Record<number, string> = {};
      try {
        const resp = await import('../../services/parametroClinico');
        const paramResult = await resp.listParametrosClinicos({ page: 1, page_size: 100 });
        if (Array.isArray(paramResult.items)) {
          paramResult.items.forEach((p: any) => {
            nombresParametros[p.id_parametro] = p.descipcion || p.codigo || `Parámetro ${p.id_parametro}`;
          });
        }
      } catch {
        parametros.forEach((id_parametro) => {
          nombresParametros[id_parametro] = `Parámetro ${id_parametro}`;
        });
      }
      const rows = fechas.map((fecha) => {
        const base: any = { fecha, cantidad: tendencias[fecha].cantidad };
        parametros.forEach((id_parametro) => {
          const nombre = nombresParametros[id_parametro] || `Parámetro ${id_parametro}`;
          base[nombre] = tendencias[fecha].promedios[id_parametro] ?? '';
        });
        return base;
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tendencias');
      XLSX.writeFile(wb, 'reporte_tendencias.xlsx');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Generar reportes</CardTitle>
          <CardDescription>Crear reportes detallados para análisis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo reporte</label>
              <Select value={reportType} onValueChange={setReportType}>
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
              <Select value={dateRange} onValueChange={setDateRange}>
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
              <Select value={format} onValueChange={setFormat} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full md:w-auto" onClick={handleGenerateReport}>
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
            {recentReports.length === 0 ? (
              <div className="text-center text-muted-foreground">No hay reportes recientes.</div>
            ) : (
              recentReports.map((report) => (
                <div key={report.id_reporte} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Reporte {report.tipo}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(report.creado_en).toLocaleDateString()} • {report.formato}
                    </p>
                    <p className="text-xs text-muted-foreground">Estado: {report.estado}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Paginador */}
          {totalReports > reportsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Página {currentPage} - Mostrando {recentReports.length} de {totalReports} reportes
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center space-x-1">
                  {currentPage > 2 && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)}>1</Button>
                      {currentPage > 3 && <span className="text-gray-400">...</span>}
                    </>
                  )}
                  {currentPage > 1 && (
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)}>
                      {currentPage - 1}
                    </Button>
                  )}
                  <Button variant="default" size="sm" disabled>
                    {currentPage}
                  </Button>
                  {Math.ceil(totalReports / reportsPerPage) > currentPage && (
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)}>
                      {currentPage + 1}
                    </Button>
                  )}
                  {Math.ceil(totalReports / reportsPerPage) > currentPage + 1 && (
                    <>
                      {Math.ceil(totalReports / reportsPerPage) > currentPage + 2 && <span className="text-gray-400">...</span>}
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.ceil(totalReports / reportsPerPage))}>
                        {Math.ceil(totalReports / reportsPerPage)}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalReports / reportsPerPage)}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

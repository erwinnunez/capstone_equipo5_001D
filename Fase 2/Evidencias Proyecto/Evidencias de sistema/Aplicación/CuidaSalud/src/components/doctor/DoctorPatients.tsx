import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Users, Search, Filter, ChevronLeft, ChevronRight, Activity, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getPacientes } from '../../services/paciente.ts';
import { listarMedicionesConAlerta, listMedicionDetalles, listarMediciones } from '../../services/medicion.ts';
import type { MedicionOut, MedicionDetalleOut } from '../../services/medicion.ts';
import { listComunas } from '../../services/comuna.ts';
import type { ComunaOut } from '../../services/comuna.ts';
import { listCesfam } from '../../services/cesfam.ts';
import type { CesfamOut } from '../../services/cesfam.ts';

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
// function InputDato({ label, value }: { label: string, value: string }) {
//   return (
//     <div className="min-w-[160px]">
//       <label className="text-xs font-medium text-gray-600 mb-0.5 block">{label}</label>
//       <Input value={value} readOnly className="rounded px-3 py-1 h-8 text-sm bg-gray-50" />
//     </div>
//   );
// }

export const DialogHandle: React.FC<pacienteDialog> = ({ paciente, comunas, cesfams, children }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // MODAL ALERTAS
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertas, setAlertas] = useState<MedicionOut[]>([]);
  const [alertasLoading, setAlertasLoading] = useState(false);
  const [alertasError, setAlertasError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalAlertas, setTotalAlertas] = useState(0);
  const pageSize = 5;

  // MODAL DETALLE DE ALERTA INDIVIDUAL
  const [detalleAlertaOpen, setDetalleAlertaOpen] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<MedicionOut | null>(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [detalles, setDetalles] = useState<MedicionDetalleOut[]>([]);

  // MODAL PROGRESO DEL PACIENTE
  const [progresoModalOpen, setProgresoModalOpen] = useState(false);
  const [medicionesProgreso, setMedicionesProgreso] = useState<any[]>([]);
  const [loadingProgreso, setLoadingProgreso] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

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

  const handleVerProgreso = async () => {
    // Configurar fechas por defecto para últimos 30 días
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    const fechaHastaDefault = hoy.toISOString().split('T')[0];
    const fechaDesdeDefault = hace30Dias.toISOString().split('T')[0];
    
    setFechaDesde(fechaDesdeDefault);
    setFechaHasta(fechaHastaDefault);
    
    setProgresoModalOpen(true);
    await cargarMedicionesProgreso(fechaDesdeDefault, fechaHastaDefault);
  };

  const cargarMedicionesProgreso = async (desde?: string, hasta?: string) => {
    setLoadingProgreso(true);
    try {
      // Obtener todas las mediciones del paciente (con y sin alertas)
      const res = await listarMediciones(1, 100);
      
      if (res.ok) {
        // Filtrar por paciente
        let medicionesFiltradas = res.data.items.filter(m => 
          String(m.rut_paciente) === String(paciente.rut_paciente)
        );
        
        // Filtrar por fechas si se proporcionan
        if (desde) {
          medicionesFiltradas = medicionesFiltradas.filter(m => 
            new Date(m.fecha_registro) >= new Date(desde)
          );
        }
        
        if (hasta) {
          medicionesFiltradas = medicionesFiltradas.filter(m => 
            new Date(m.fecha_registro) <= new Date(hasta)
          );
        }

        // Procesar datos para el gráfico
        const datosGrafico = await procesarMedicionesParaGrafico(medicionesFiltradas);
        setMedicionesProgreso(datosGrafico);
      }
    } catch (error) {
      console.error('Error cargando mediciones:', error);
    }
    setLoadingProgreso(false);
  };

  const procesarMedicionesParaGrafico = async (mediciones: MedicionOut[]) => {
    // Agrupar mediciones por día
    const agrupadasPorDia: Record<string, any[]> = {};
    for (const medicion of mediciones) {
      const fecha = new Date(medicion.fecha_registro).toLocaleDateString();
      if (!agrupadasPorDia[fecha]) agrupadasPorDia[fecha] = [];
      agrupadasPorDia[fecha].push(medicion);
    }

    // Para cada día, calcular el promedio de cada parámetro y mostrar 1 decimal
    const tendenciaPorDia: any[] = [];
    for (const fecha in agrupadasPorDia) {
      const medicionesDia = agrupadasPorDia[fecha];
      // Arrays para cada parámetro
      const glucosa: number[] = [];
      const presionSis: number[] = [];
      const presionDia: number[] = [];
      const oxigeno: number[] = [];
      const temperatura: number[] = [];

      for (const medicion of medicionesDia) {
        const detallesRes = await listMedicionDetalles({ id_medicion: medicion.id_medicion });
        if (detallesRes.ok) {
          detallesRes.data.items.forEach((detalle: MedicionDetalleOut) => {
            switch (detalle.id_parametro) {
              case 1:
                if (typeof detalle.valor_num === 'number') glucosa.push(detalle.valor_num);
                break;
              case 2:
                if (typeof detalle.valor_num === 'number') presionSis.push(detalle.valor_num);
                break;
              case 5:
                if (typeof detalle.valor_num === 'number') presionDia.push(detalle.valor_num);
                break;
              case 3:
                if (typeof detalle.valor_num === 'number') oxigeno.push(detalle.valor_num);
                break;
              case 4:
                if (typeof detalle.valor_num === 'number') temperatura.push(detalle.valor_num);
                break;
            }
          });
        }
      }

      // Calcular promedios y mostrar 1 decimal
      const promedio = (arr: number[]) => arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : null;
      tendenciaPorDia.push({
        date: fecha,
        bloodSugar: promedio(glucosa),
        bloodPressureSys: promedio(presionSis),
        bloodPressureDia: promedio(presionDia),
        oxygen: promedio(oxigeno),
        temperature: promedio(temperatura)
      });
    }

    // Ordenar por fecha y mostrar todos los días en los que hay mediciones
    return tendenciaPorDia.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const descargarMediciones = () => {
    // Crear CSV con las mediciones filtradas
    const headers = ['Fecha', 'Glucosa (mg/dL)', 'Presion Sistolica (mmHg)', 'Presion Diastolica (mmHg)', 'Saturacion O2 (%)', 'Temperatura (°C)'];
    
    // Agregar BOM para UTF-8 y mejorar compatibilidad con Excel
    const BOM = '\uFEFF';
    
    const csvRows = [
      headers.join(';'), // Usar punto y coma como separador para Excel
      ...medicionesProgreso.map((row: any) => 
        [
          row.date || '',
          row.bloodSugar || '',
          row.bloodPressureSys || '',
          row.bloodPressureDia || '',
          row.oxygen || '',
          row.temperature || ''
        ].join(';')
      )
    ];
    
    const csvContent = BOM + csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mediciones_${paciente.primer_nombre_paciente}_${paciente.primer_apellido_paciente}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    // Limpiar el URL del objeto
    URL.revokeObjectURL(link.href);
  };

  const aplicarFiltroFechas = () => {
    cargarMedicionesProgreso(fechaDesde, fechaHasta);
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
      // setTotalAlertas(res.data.total); // No usado actualmente
    } else {
      setAlertasError(res.message);
      setAlertas([]);
      // setTotalAlertas(0); // No usado actualmente
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

  // const totalPages = Math.ceil(alertas.length / pageSize); // No usado actualmente

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] w-[90vw] max-w-4xl overflow-auto p-6 bg-white rounded-xl shadow-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-black font-semibold text-sm">
                {paciente.primer_nombre_paciente.charAt(0)}{paciente.primer_apellido_paciente.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  {paciente.primer_nombre_paciente} {paciente.segundo_nombre_paciente}{' '}
                  {paciente.primer_apellido_paciente} {paciente.segundo_apellido_paciente}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={paciente.estado ? "default" : "secondary"} className="text-xs">
                    {paciente.estado ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {paciente.tipo_paciente}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col space-y-6 px-2">
            {/* Datos personales */}
            <section>
              <h3 className="text-lg font-semibold text-blue-600 flex items-center mb-3 border-b border-blue-200 pb-1">
                <Users className="w-5 h-5 mr-2" />
                Datos personales
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">RUT</label>
                  <div className="p-2 bg-gray-50 rounded-md border text-sm font-mono">{paciente.rut_paciente}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Comuna</label>
                  <div className="p-2 bg-gray-50 rounded-md border text-sm">{nombreComuna(paciente.id_comuna)}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">CESFAM</label>
                  <div className="p-2 bg-gray-50 rounded-md border text-sm">{nombreCesfam(paciente.id_cesfam)}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Edad</label>
                  <div className="p-2 bg-gray-50 rounded-md border text-sm">{calculateAge(paciente.fecha_nacimiento)} años</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Sexo</label>
                  <div className="p-2 bg-gray-50 rounded-md border text-sm">{paciente.sexo ? 'Masculino' : 'Femenino'}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Tipo de Sangre</label>
                  <div className="p-2 bg-red-50 rounded-md border border-red-200 text-sm font-semibold text-red-700">{paciente.tipo_de_sangre}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Seguro</label>
                  <div className="p-2 bg-gray-50 rounded-md border text-sm">{paciente.seguro || 'Ninguno'}</div>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-sm font-medium text-gray-600">Dirección</label>
                  <div className="p-2 bg-gray-50 rounded-md border text-sm">{paciente.direccion}</div>
                </div>
              </div>
            </section>

            {/* Contacto y estado */}
            <section>
              <h3 className="text-lg font-semibold text-green-600 flex items-center mb-3 border-b border-green-200 pb-1">
                <Activity className="w-5 h-5 mr-2" />
                Contacto y estado
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <div className="p-2 bg-gray-50 rounded-md border text-sm font-mono">{paciente.telefono}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <div className="p-2 bg-gray-50 rounded-md border text-sm text-blue-600">{paciente.email}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Enfermedades</label>
                  <div className="p-2 bg-orange-50 rounded-md border border-orange-200 text-sm">{paciente.enfermedades || 'Ninguna'}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Activo CESFAM</label>
                  <Badge variant={paciente.activo_cesfam ? "default" : "secondary"}>
                    {paciente.activo_cesfam ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Contacto de Emergencia</label>
                  <div className="p-2 bg-yellow-50 rounded-md border border-yellow-200 text-sm">{paciente.nombre_contacto}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Teléfono Emergencia</label>
                  <div className="p-2 bg-yellow-50 rounded-md border border-yellow-200 text-sm font-mono">{paciente.telefono_contacto}</div>
                </div>
              </div>
            </section>

            {/* Fechas */}
            <section>
              <h3 className="text-lg font-semibold text-purple-600 flex items-center mb-3 border-b border-purple-200 pb-1">
                📅 Vigencia
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Inicio CESFAM</label>
                  <div className="p-2 bg-green-50 rounded-md border border-green-200 text-sm">{new Date(paciente.fecha_inicio_cesfam).toLocaleDateString('es-ES')}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Fin CESFAM</label>
                  <div className="p-2 bg-gray-50 rounded-md border text-sm">{paciente.fecha_fin_cesfam ? new Date(paciente.fecha_fin_cesfam).toLocaleDateString('es-ES') : 'Sin fecha de fin'}</div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleVerProgreso} className="bg-blue-600 hover:bg-blue-700 text-black border border-blue-700">
                <Activity className="w-4 h-4 mr-2" />
                Ver progreso
              </Button>
              <Button variant="outline" onClick={handleVerAlertas} className="border-orange-300 text-orange-600 hover:bg-orange-50">
                🚨 Ver alertas
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
                    {currentPage > 1 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                    ) : (
                      <div></div>
                    )}
                    <span className="text-sm text-gray-600">
                      Página {currentPage} ({alertas.length} alertas en esta página)
                    </span>
                    {alertas.length === pageSize ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <div></div>
                    )}
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

      {/* MODAL DE PROGRESO DEL PACIENTE */}
      <Dialog open={progresoModalOpen} onOpenChange={setProgresoModalOpen}>
        <DialogContent className="max-h-[80vh] w-[90vw] max-w-5xl overflow-y-auto p-6 bg-white rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Progreso de {paciente.primer_nombre_paciente} {paciente.primer_apellido_paciente}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filtros de fecha */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Filtros y Descarga</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Fecha desde</label>
                    <Input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Fecha hasta</label>
                    <Input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Button onClick={aplicarFiltroFechas} disabled={loadingProgreso} className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Aplicar Filtro
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={descargarMediciones} disabled={medicionesProgreso.length === 0} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de mediciones */}
            {loadingProgreso ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando mediciones...</p>
              </div>
            ) : medicionesProgreso.length > 0 ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tendencia de Mediciones</CardTitle>
                  <CardDescription className="text-sm">
                    Evolución de los parámetros vitales en el tiempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={medicionesProgreso}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip 
                          labelFormatter={(value) => `Fecha: ${value}`}
                          formatter={(value: any, name: string) => {
                            if (value === null) return ['Sin datos', name];
                            const labels: { [key: string]: string } = {
                              bloodSugar: 'Glucosa (mg/dL)',
                              bloodPressureSys: 'P. Sistólica (mmHg)',
                              bloodPressureDia: 'P. Diastólica (mmHg)',
                              oxygen: 'Sat. O2 (%)',
                              temperature: 'Temperatura (°C)'
                            };
                            return [value, labels[name] || name];
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="bloodSugar" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          connectNulls={false}
                          name="bloodSugar"
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="bloodPressureSys" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          connectNulls={false}
                          name="bloodPressureSys"
                          dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="bloodPressureDia" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          connectNulls={false}
                          name="bloodPressureDia"
                          dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="oxygen" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          connectNulls={false}
                          name="oxygen"
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          connectNulls={false}
                          name="temperature"
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Leyenda */}
                  <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>Glucosa (mg/dL)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>P. Sistólica (mmHg)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span>P. Diastólica (mmHg)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Saturación O2 (%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span>Temperatura (°C)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No se encontraron mediciones para mostrar</p>
                <p className="text-xs">Ajuste los filtros de fecha para ver más datos</p>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setProgresoModalOpen(false)}>
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

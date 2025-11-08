// src/components/DoctorAnalytics.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { listarMedicionesConAlerta, listMedicionDetalles } from '../../services/medicion';
import { RANGOS_MEDICOS } from '../../services/validacionMediciones';

interface TrendData {
  date: string;
  bloodSugar: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  oxygenSaturation: number | null;
  temperature: number | null;
  [key: string]: any;
}

interface AlertSummary {
  type: string;
  count: number;
  color: string;
}

export default function DoctorAnalytics() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [alertData, setAlertData] = useState<AlertSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Obtener mediciones con alertas de los últimos 30 días
      const alertMeasurements = await listarMedicionesConAlerta(1, 500); // Aumentar límite
      
      if (!alertMeasurements.ok) {
        throw new Error(alertMeasurements.message || 'Error obteniendo mediciones');
      }

      console.log(`🔍 Total mediciones con alerta obtenidas: ${alertMeasurements.data.items.length}`);

      // 2. Filtrar por últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentMeasurements = alertMeasurements.data.items.filter(measurement => 
        new Date(measurement.fecha_registro) >= thirtyDaysAgo
      );

      console.log(`📅 Mediciones con alerta de últimos 30 días: ${recentMeasurements.length}`);

      // 3. Obtener detalles de cada medición para el gráfico de tendencias
      const measurementsWithDetails = await Promise.all(
        recentMeasurements.map(async (medicion) => {
          try {
            const detallesResponse = await listMedicionDetalles({
              id_medicion: medicion.id_medicion,
              page_size: 20
            });
            
            if (detallesResponse.ok) {
              return {
                ...medicion,
                detalles: detallesResponse.data.items || []
              };
            }
            return { ...medicion, detalles: [] };
          } catch {
            return { ...medicion, detalles: [] };
          }
        })
      );

      // 4. Procesar datos para gráfico de tendencias
      const trendDataMap = new Map<string, {
        date: string;
        bloodSugar: number[];
        bloodPressureSystolic: number[];
        bloodPressureDiastolic: number[];
        oxygenSaturation: number[];
        temperature: number[];
      }>();

      // Función para obtener fecha local sin problemas de zona horaria
      const getLocalDateKey = (dateString: string): string => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      measurementsWithDetails.forEach(medicion => {
        const dateKey = getLocalDateKey(medicion.fecha_registro);
        
        console.log(`📊 Procesando medición ID ${medicion.id_medicion} del ${dateKey} (original: ${medicion.fecha_registro}):`, medicion);
        
        if (!trendDataMap.has(dateKey)) {
          trendDataMap.set(dateKey, {
            date: dateKey,
            bloodSugar: [],
            bloodPressureSystolic: [],
            bloodPressureDiastolic: [],
            oxygenSaturation: [],
            temperature: []
          });
        }

        const dayData = trendDataMap.get(dateKey)!;

        medicion.detalles.forEach((detalle: any) => {
          if (detalle.valor_num != null) {
            console.log(`  📋 Detalle parametro ${detalle.id_parametro}: ${detalle.valor_num}`);
            switch (detalle.id_parametro) {
              case 1: // Glucosa
                dayData.bloodSugar.push(detalle.valor_num);
                break;
              case 2: // Presión Sistólica
                dayData.bloodPressureSystolic.push(detalle.valor_num);
                break;
              case 3: // Presión Diastólica  
                dayData.bloodPressureDiastolic.push(detalle.valor_num);
                break;
              case 4: // Saturación O2
                dayData.oxygenSaturation.push(detalle.valor_num);
                break;
              case 5: // Temperatura
                dayData.temperature.push(detalle.valor_num);
                break;
            }
          }
        });
        
        console.log(`  📈 Datos del día ${dateKey} después de procesar:`, dayData);
      });

      // Calcular promedios para cada día y convertir a formato final
      const sortedTrendData: TrendData[] = Array.from(trendDataMap.values()).map(dayData => ({
        date: dayData.date,
        bloodSugar: dayData.bloodSugar.length > 0 
          ? Math.round((dayData.bloodSugar.reduce((a, b) => a + b, 0) / dayData.bloodSugar.length) * 100) / 100 
          : null,
        bloodPressureSystolic: dayData.bloodPressureSystolic.length > 0 
          ? Math.round((dayData.bloodPressureSystolic.reduce((a, b) => a + b, 0) / dayData.bloodPressureSystolic.length) * 100) / 100 
          : null,
        bloodPressureDiastolic: dayData.bloodPressureDiastolic.length > 0 
          ? Math.round((dayData.bloodPressureDiastolic.reduce((a, b) => a + b, 0) / dayData.bloodPressureDiastolic.length) * 100) / 100 
          : null,
        oxygenSaturation: dayData.oxygenSaturation.length > 0 
          ? Math.round((dayData.oxygenSaturation.reduce((a, b) => a + b, 0) / dayData.oxygenSaturation.length) * 100) / 100 
          : null,
        temperature: dayData.temperature.length > 0 
          ? Math.round((dayData.temperature.reduce((a, b) => a + b, 0) / dayData.temperature.length) * 100) / 100 
          : null
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setTrendData(sortedTrendData);
      console.log(`📊 Datos de tendencias procesados: ${sortedTrendData.length} días con datos`, sortedTrendData);

      // 5. Procesar datos para gráfico de alertas (clasificar por severidad usando rangos médicos)
      let criticalCount = 0;
      let warningCount = 0;
      let normalCount = 0;

      measurementsWithDetails.forEach(medicion => {
        medicion.detalles.forEach((detalle: any) => {
          if (detalle.valor_num != null) {
            let tipoParametro: keyof typeof RANGOS_MEDICOS;
            
            switch (detalle.id_parametro) {
              case 1:
                tipoParametro = 'GLUCOSA';
                break;
              case 2:
                tipoParametro = 'PRESION_SISTOLICA';
                break;
              case 3:
                tipoParametro = 'PRESION_DIASTOLICA';
                break;
              case 4:
                tipoParametro = 'SATURACION_OXIGENO';
                break;
              case 5:
                tipoParametro = 'TEMPERATURA';
                break;
              default:
                return;
            }

            const rango = RANGOS_MEDICOS[tipoParametro];
            const valor = detalle.valor_num;

            // Clasificar según los rangos definidos
            if (valor < rango.min_posible || valor > rango.max_posible) {
              // Fuera del rango posible = crítico
              criticalCount++;
            } else if (valor < rango.min_critico || valor > rango.max_critico) {
              // Fuera del rango crítico = crítico
              criticalCount++;
            } else if (valor < rango.min_normal || valor > rango.max_normal) {
              // Fuera del rango normal = warning
              warningCount++;
            } else {
              // Dentro del rango normal
              normalCount++;
            }
          }
        });
      });

      setAlertData([
        { type: 'Críticas', count: criticalCount, color: '#ef4444' },
        { type: 'Advertencias', count: warningCount, color: '#f59e0b' },
        { type: 'Normales', count: normalCount, color: '#10b981' },
      ]);

      console.log(`🚨 Alertas procesadas - Críticas: ${criticalCount}, Advertencias: ${warningCount}, Normales: ${normalCount}`);

    } catch (error: any) {
      setError(error.message || 'Error cargando datos de analíticas');
      console.error('Error en loadAnalyticsData:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Cargando datos de tendencias...</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Cargando datos de alertas...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center justify-center h-80">
            <div className="text-center">
              <p className="text-red-600 font-medium">Error cargando analíticas</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
              <button 
                onClick={loadAnalyticsData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center h-80">
            <div className="text-center">
              <p className="text-red-600 font-medium">Error cargando analíticas</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Alertas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alertData.reduce((sum, item) => sum + item.count, 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                📊
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Críticas</p>
                <p className="text-2xl font-bold text-red-600">
                  {alertData.find(item => item.type === 'Críticas')?.count || 0}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                🚨
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Advertencias</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alertData.find(item => item.type === 'Advertencias')?.count || 0}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                ⚠️
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Días con Datos</p>
                <p className="text-2xl font-bold text-green-600">
                  {trendData.length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                📅
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tendencias de Pacientes con Alertas (30 días)</CardTitle>
          <p className="text-sm text-gray-500">
            Mediciones de pacientes que han generado alertas médicas
          </p>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    // Evitar problemas de zona horaria al formatear
                    const [year, month, day] = value.split('-');
                    return new Date(year, month - 1, day).toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    });
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => {
                    // Evitar problemas de zona horaria en tooltip
                    const [year, month, day] = value.toString().split('-');
                    return `Fecha: ${new Date(year, month - 1, day).toLocaleDateString('es-ES')}`;
                  }}
                  formatter={(value: any, name: string) => {
                    if (value === null) return ['Sin datos', name];
                    const labels: { [key: string]: string } = {
                      bloodSugar: 'Glucosa (mg/dL)',
                      bloodPressureSystolic: 'P. Sistólica (mmHg)',
                      bloodPressureDiastolic: 'P. Diastólica (mmHg)', 
                      oxygenSaturation: 'Sat. O2 (%)',
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
                />
                <Line 
                  type="monotone" 
                  dataKey="bloodPressureSystolic" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  connectNulls={false}
                  name="bloodPressureSystolic"
                />
                <Line 
                  type="monotone" 
                  dataKey="oxygenSaturation" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  connectNulls={false}
                  name="oxygenSaturation"
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  connectNulls={false}
                  name="temperature"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <p className="text-gray-500">No hay datos de tendencias disponibles</p>
                <p className="text-sm text-gray-400 mt-1">
                  No se encontraron mediciones con alertas en los últimos 30 días
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de Alertas por Severidad</CardTitle>
          <p className="text-sm text-gray-500">
            Clasificación de alertas médicas generadas
          </p>
        </CardHeader>
        <CardContent>
          {alertData.length > 0 && alertData.some(alert => alert.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alertData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {alertData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <p className="text-gray-500">No hay alertas registradas</p>
                <p className="text-sm text-gray-400 mt-1">
                  Todas las mediciones están dentro de rangos normales
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

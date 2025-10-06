// src/components/DoctorReports.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Download } from 'lucide-react';

const recentReports = [
  { name: 'Reporte Resumen Pacientes - Enero 2024', date: '2024-01-20', format: 'PDF' },
  { name: 'Análisis de alertas - Semana 3', date: '2024-01-18', format: 'Excel' },
  { name: 'Tendencias - Q1 2024', date: '2024-01-15', format: 'PDF' },
];

export default function DoctorReports() {
  const [reportType, setReportType] = useState('patient');
  const [dateRange, setDateRange] = useState('30days');
  const [format, setFormat] = useState('pdf');

  const handleGenerateReport = () => {
    console.log('Generating report:', { reportType, dateRange, format });
    // Aquí iría la lógica para generar el reporte
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
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
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
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{report.name}</h4>
                  <p className="text-sm text-gray-600">{report.date} • {report.format}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

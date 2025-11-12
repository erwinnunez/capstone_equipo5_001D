// src/components/admin/AdminAnalytics.tsx

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Example data for KPIs
const enfermedadesPorComuna = [
  { comuna: "Santiago", casos: 120, poblacion: 50000 },
  { comuna: "Providencia", casos: 80, poblacion: 30000 },
  { comuna: "Ñuñoa", casos: 60, poblacion: 25000 },
  { comuna: "Puente Alto", casos: 200, poblacion: 90000 },
];

const tasaPorComuna = enfermedadesPorComuna.map(e => ({
  comuna: e.comuna,
  tasa: ((e.casos / e.poblacion) * 1000).toFixed(2)
}));

const cesfamAlertas = [
  { cesfam: "CESFAM Central", tiempos: [2, 4, 1, 3] },
  { cesfam: "CESFAM Norte", tiempos: [5, 6, 4] },
  { cesfam: "CESFAM Sur", tiempos: [1, 2, 2, 3, 1] },
];
const tiempoPromedioPorCesfam = cesfamAlertas.map(c => ({
  cesfam: c.cesfam,
  promedio: (c.tiempos.reduce((a, b) => a + b, 0) / c.tiempos.length).toFixed(1)
}));

const alertasPorTipo = [
  { tipo: "Glucosa", cantidad: 35 },
  { tipo: "Presión arterial", cantidad: 50 },
  { tipo: "Saturación", cantidad: 20 },
  { tipo: "Temperatura", cantidad: 15 },
];

// Chart.js configs
const tasaComunaData = {
  labels: tasaPorComuna.map(t => t.comuna),
  datasets: [
    {
      label: 'Tasa de enfermedades por comuna (por mil habitantes)',
      data: tasaPorComuna.map(t => t.tasa),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
    },
  ],
};

const tiempoCesfamData = {
  labels: tiempoPromedioPorCesfam.map(t => t.cesfam),
  datasets: [
    {
      label: 'Tiempo promedio de resolución (días)',
      data: tiempoPromedioPorCesfam.map(t => t.promedio),
      backgroundColor: 'rgba(16, 185, 129, 0.7)',
    },
  ],
};

const alertasTipoData = {
  labels: alertasPorTipo.map(a => a.tipo),
  datasets: [
    {
      label: 'Cantidad de alertas',
      data: alertasPorTipo.map(a => a.cantidad),
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(251, 191, 36, 0.7)',
      ],
    },
  ],
};

export default function AdminAnalytics() {
  // Referencias a los canvas
  const barComunaRef = useRef<HTMLCanvasElement>(null);
  const barCesfamRef = useRef<HTMLCanvasElement>(null);
  const pieTipoRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Gráfico 1: Tasa de enfermedades por comuna
    const ctx1 = barComunaRef.current?.getContext('2d');
    if (ctx1) {
      const chart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: tasaPorComuna.map(t => t.comuna),
          datasets: [{
            label: 'Tasa de enfermedades por comuna (por mil habitantes)',
            data: tasaPorComuna.map(t => t.tasa),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Tasa por mil habitantes' },
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Tasa' } },
            x: { title: { display: true, text: 'Comuna' } },
          },
        },
      });
      return () => chart1.destroy();
    }
  }, []);

  useEffect(() => {
    // Gráfico 2: Tiempo promedio de resolución de alertas por CESFAM
    const ctx2 = barCesfamRef.current?.getContext('2d');
    if (ctx2) {
      const chart2 = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: tiempoPromedioPorCesfam.map(t => t.cesfam),
          datasets: [{
            label: 'Tiempo promedio de resolución (días)',
            data: tiempoPromedioPorCesfam.map(t => t.promedio),
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Promedio de días' },
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Días' } },
            x: { title: { display: true, text: 'CESFAM' } },
          },
        },
      });
      return () => chart2.destroy();
    }
  }, []);

  useEffect(() => {
    // Gráfico 3: Cantidad de alertas por tipo de medición
    const ctx3 = pieTipoRef.current?.getContext('2d');
    if (ctx3) {
      const chart3 = new Chart(ctx3, {
        type: 'pie',
        data: {
          labels: alertasPorTipo.map(a => a.tipo),
          datasets: [{
            label: 'Cantidad de alertas',
            data: alertasPorTipo.map(a => a.cantidad),
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(239, 68, 68, 0.7)',
              'rgba(251, 191, 36, 0.7)',
            ],
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Proporción por tipo de medición' },
          },
        },
      });
      return () => chart3.destroy();
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* KPI 1: Tasa de enfermedades por comuna */}
      <Card>
        <CardHeader>
          <CardTitle>Tasa de incidencia de enfermedades por comuna</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas ref={barComunaRef} height={300} />
        </CardContent>
      </Card>

      {/* KPI 2: Tiempo promedio de resolución de alertas por CESFAM */}
      <Card>
        <CardHeader>
          <CardTitle>Tiempo medio de resolución de alertas por CESFAM</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas ref={barCesfamRef} height={300} />
        </CardContent>
      </Card>

      {/* KPI 3: Cantidad de alertas por tipo de medición */}
      <Card>
        <CardHeader>
          <CardTitle>Frecuencia de alertas por tipo de medición</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas ref={pieTipoRef} height={300} />
        </CardContent>
      </Card>
    </div>
  );
}

// src/components/DoctorAnalytics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';

const chartData = [
  { date: '2024-01-15', bloodSugar: 120, bloodPressure: 140, temperature: 98.6 },
  { date: '2024-01-16', bloodSugar: 135, bloodPressure: 145, temperature: 99.1 },
  { date: '2024-01-17', bloodSugar: 110, bloodPressure: 138, temperature: 98.4 },
  { date: '2024-01-18', bloodSugar: 125, bloodPressure: 142, temperature: 98.8 },
  { date: '2024-01-19', bloodSugar: 140, bloodPressure: 150, temperature: 99.2 },
  { date: '2024-01-20', bloodSugar: 118, bloodPressure: 136, temperature: 98.5 },
];

const alertData = [
  { type: 'Critical', count: 5, color: '#ef4444' },
  { type: 'Warning', count: 12, color: '#f59e0b' },
  { type: 'Normal', count: 28, color: '#10b981' },
];

export default function DoctorAnalytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tendencias de pacientes (30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bloodSugar" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="bloodPressure" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alertData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {alertData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

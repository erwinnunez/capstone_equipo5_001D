// src/components/paciente/PatientProgress.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { recentMeasurements } from '../../data/patientMock';

export default function PatientProgress({
  currentStreak,
  totalPoints,
}: {
  currentStreak: number;
  totalPoints: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del progreso</CardTitle>
        <CardDescription>Realice un seguimiento de su progreso en materia de salud a lo largo del tiempo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{currentStreak}</div>
            <p className="text-sm text-blue-600">Racha de días</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
            <p className="text-sm text-green-600">Puntos totales</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">85%</div>
            <p className="text-sm text-purple-600">Metas con</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={recentMeasurements}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bloodSugar" stroke="#3b82f6" strokeWidth={2} name="Blood Sugar" />
            <Line type="monotone" dataKey="bloodPressure" stroke="#ef4444" strokeWidth={2} name="Blood Pressure" />
            <Line type="monotone" dataKey="oxygen" stroke="#10b981" strokeWidth={2} name="Oxygen %" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

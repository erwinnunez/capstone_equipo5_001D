import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Plus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { recentMeasurements } from '../../data/patientMock';

import { createMedicionWithDetails } from '../../services/paciente';
import type { MedicionCreatePayload, Severidad } from '../../services/paciente';

interface Props {
  rutPaciente?: number;
}

export default function PatientMeasurements({ rutPaciente }: Props) {
  const [newMeasurement, setNewMeasurement] = useState({
    bloodSugar: '',
    bloodPressure: '',
    oxygen: '',
    temperature: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const weeklyGoal = 7;
  const weeklyProgress = 5;

  const handleAddMeasurement = async () => {
    if (!rutPaciente) return;

    const [sysStr, diaStrRaw] = (newMeasurement.bloodPressure || '').split('/');
    const sys = Number(sysStr);
    const dia = Number(diaStrRaw);

    let bpSeverity: Severidad = 'normal';
    if (!Number.isNaN(sys) && !Number.isNaN(dia)) {
      if (sys >= 140 || dia >= 90) bpSeverity = 'critical';
      else if (sys >= 130 || dia >= 85) bpSeverity = 'warning';
    }

    const nowIso = new Date().toISOString();
    const baseMedicion: MedicionCreatePayload = {
      rut_paciente: rutPaciente,
      fecha_registro: nowIso,
      origen: 'WEB',
      registrado_por: 'SELF',
      observacion: newMeasurement.notes || '',
      evaluada_en: nowIso,
      tiene_alerta: bpSeverity !== 'normal',
      severidad_max: bpSeverity,
      resumen_alerta:
        bpSeverity === 'critical'
          ? 'Presión arterial elevada'
          : bpSeverity === 'warning'
          ? 'Presión arterial levemente elevada'
          : 'Sin alerta',
    };

    const detalles: Array<{
      id_parametro: number;
      id_unidad: number;
      valor_num: number;
      valor_texto: string;
      fuera_rango: boolean;
      severidad: Severidad | string;
      umbral_min: number;
      umbral_max: number;
      tipo_alerta: string;
    }> = [];

    if (newMeasurement.bloodSugar) {
      const bg = Number(newMeasurement.bloodSugar);
      detalles.push({
        id_parametro: 1,
        id_unidad: 1,
        valor_num: bg,
        valor_texto: `${bg} mg/dL`,
        fuera_rango: bg < 70 || bg > 140,
        severidad: bg >= 180 ? 'critical' : bg > 140 || bg < 70 ? 'warning' : 'normal',
        umbral_min: 70,
        umbral_max: 140,
        tipo_alerta: bg >= 180 ? 'BG_HIGH' : bg < 70 ? 'BG_LOW' : 'NONE',
      });
    }

    if (!Number.isNaN(sys) && !Number.isNaN(dia)) {
      detalles.push({
        id_parametro: 2,
        id_unidad: 2,
        valor_num: sys,
        valor_texto: `${sys}/${dia} mmHg`,
        fuera_rango: bpSeverity !== 'normal',
        severidad: bpSeverity,
        umbral_min: 80,
        umbral_max: 129,
        tipo_alerta: bpSeverity === 'critical' ? 'BP_HIGH' : bpSeverity === 'warning' ? 'BP_ELEVATED' : 'NONE',
      });
    }

    if (newMeasurement.oxygen) {
      const ox = Number(newMeasurement.oxygen);
      detalles.push({
        id_parametro: 3,
        id_unidad: 3,
        valor_num: ox,
        valor_texto: `${ox}%`,
        fuera_rango: ox < 95,
        severidad: ox < 92 ? 'critical' : ox < 95 ? 'warning' : 'normal',
        umbral_min: 95,
        umbral_max: 100,
        tipo_alerta: ox < 92 ? 'O2_LOW' : ox < 95 ? 'O2_WARN' : 'NONE',
      });
    }

    if (newMeasurement.temperature) {
      const t = Number(newMeasurement.temperature);
      detalles.push({
        id_parametro: 4,
        id_unidad: 4,
        valor_num: Math.round(t * 10),
        valor_texto: `${t} °C`,
        fuera_rango: t >= 37.8,
        severidad: t >= 38.5 ? 'critical' : t >= 37.8 ? 'warning' : 'normal',
        umbral_min: 36,
        umbral_max: 37.7,
        tipo_alerta: t >= 38.5 ? 'FEVER_HIGH' : t >= 37.8 ? 'FEVER' : 'NONE',
      });
    }

    try {
      setSubmitting(true);
      await createMedicionWithDetails({ medicion: baseMedicion, detalles });
      setNewMeasurement({ bloodSugar: '', bloodPressure: '', oxygen: '', temperature: '', notes: '' });
      alert('Medición registrada correctamente.');
    } catch (e: any) {
      alert(e?.message ?? 'No se pudo registrar la medición.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Measurement */}
        <Card>
          <CardHeader>
            <CardTitle>Record Today's Measurements</CardTitle>
            <CardDescription>Enter your health measurements for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Blood Sugar (mg/dL)</label>
                <Input
                  type="number"
                  placeholder="120"
                  value={newMeasurement.bloodSugar}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, bloodSugar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Blood Pressure (sys/dia)</label>
                <Input
                  placeholder="120/80"
                  value={newMeasurement.bloodPressure}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, bloodPressure: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Oxygen Level (%)</label>
                <Input
                  type="number"
                  placeholder="98"
                  value={newMeasurement.oxygen}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, oxygen: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Temperature (°C)</label>
                <Input
                  type="number"
                  placeholder="36.8"
                  step="0.1"
                  value={newMeasurement.temperature}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, temperature: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Optional notes..."
                value={newMeasurement.notes}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
              />
            </div>

            {!rutPaciente && (
              <p className="text-sm text-amber-600">
                No se encontró el rut del paciente (rutPaciente). Asegúrate de pasarlo desde el Login.
              </p>
            )}

            <Button onClick={handleAddMeasurement} className="w-full" disabled={submitting || !rutPaciente}>
              <Plus className="h-4 w-4 mr-2" />
              {submitting ? 'Saving…' : 'Record Measurements'}
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Goals</CardTitle>
            <CardDescription>Track your progress towards weekly health goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Measurements This Week</span>
                <span className="text-sm text-muted-foreground">
                  {weeklyProgress}/{weeklyGoal}
                </span>
              </div>
              <Progress value={(weeklyProgress / weeklyGoal) * 100} className="h-2" />
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Great Progress!</h4>
              <p className="text-sm text-green-700">
                You've logged {weeklyProgress} out of {weeklyGoal} measurements this week. Keep going to maintain your streak!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Measurements Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trends</CardTitle>
          <CardDescription>Your measurement history over the past 5 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recentMeasurements}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bloodSugar" stroke="#3b82f6" strokeWidth={2} name="Blood Sugar" />
              <Line type="monotone" dataKey="oxygen" stroke="#10b981" strokeWidth={2} name="Oxygen %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

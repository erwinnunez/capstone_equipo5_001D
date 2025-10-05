// src/components/paciente/PatientMeasurements.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Plus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { recentMeasurements } from '../../data/patientMock';

export default function PatientMeasurements() {
  const [newMeasurement, setNewMeasurement] = useState({
    bloodSugar: '',
    bloodPressure: '',
    oxygen: '',
    temperature: ''
  });

  const weeklyGoal = 7;
  const weeklyProgress = 5;

  const handleAddMeasurement = () => {
    console.log('Adding measurement:', newMeasurement);
    setNewMeasurement({ bloodSugar: '', bloodPressure: '', oxygen: '', temperature: '' });
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
                <label className="text-sm font-medium">Blood Pressure</label>
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
                <label className="text-sm font-medium">Temperature (°F)</label>
                <Input
                  type="number"
                  placeholder="98.6"
                  step="0.1"
                  value={newMeasurement.temperature}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, temperature: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddMeasurement} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Record Measurements
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
                <span className="text-sm text-muted-foreground">{weeklyProgress}/{weeklyGoal}</span>
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

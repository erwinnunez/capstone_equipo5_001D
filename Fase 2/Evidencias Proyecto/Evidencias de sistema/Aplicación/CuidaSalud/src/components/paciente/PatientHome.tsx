// src/components/paciente/PatientHome.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity, Heart, Thermometer, Droplets, Star, Target } from 'lucide-react';

export default function PatientHome({
  user,
  totalPoints,
  currentStreak,
}: {
  user: { name: string };
  totalPoints: number;
  currentStreak: number;
}) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Welcome back, {user.name}!</h2>
        <p className="text-blue-100">Keep up the great work with your health monitoring</p>
        <div className="mt-4 flex items-center space-x-6">
          <div className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            <span>{totalPoints} Points</span>
          </div>
          <div className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            <span>{currentStreak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Sugar</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120 mg/dL</div>
            <p className="text-xs text-green-600">↓ 5% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120/80</div>
            <p className="text-xs text-green-600">Normal range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oxygen Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-green-600">Excellent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.6°F</div>
            <p className="text-xs text-green-600">Normal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

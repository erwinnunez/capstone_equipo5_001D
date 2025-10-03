import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Plus,
  Star
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

// Mock data
const recentMeasurements = [
  { date: '2024-01-20', bloodSugar: 120, bloodPressure: 120, oxygen: 98, temperature: 98.6 },
  { date: '2024-01-19', bloodSugar: 135, bloodPressure: 125, oxygen: 97, temperature: 99.1 },
  { date: '2024-01-18', bloodSugar: 110, bloodPressure: 118, oxygen: 99, temperature: 98.4 },
  { date: '2024-01-17', bloodSugar: 125, bloodPressure: 122, oxygen: 98, temperature: 98.8 },
  { date: '2024-01-16', bloodSugar: 140, bloodPressure: 130, oxygen: 96, temperature: 99.2 }
];

const achievements = [
  { id: 1, title: 'Week Warrior', description: '7 days of consistent logging', icon: '🏆', earned: true },
  { id: 2, title: 'Health Hero', description: '30 days streak', icon: '⭐', earned: true },
  { id: 3, title: 'Perfect Week', description: 'All measurements in range', icon: '💯', earned: true },
  { id: 4, title: 'Early Bird', description: 'Log measurements before 9 AM', icon: '🌅', earned: false },
  { id: 5, title: 'Century Club', description: '100 total measurements', icon: '💪', earned: false }
];

export function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const [newMeasurement, setNewMeasurement] = useState({
    bloodSugar: '',
    bloodPressure: '',
    oxygen: '',
    temperature: ''
  });

  const currentStreak = 14;
  const totalPoints = 1250;
  const weeklyGoal = 7;
  const weeklyProgress = 5;

  const sidebarContent = (
    <nav className="space-y-2">
      <Button variant="default" className="w-full justify-start">
        <Activity className="h-4 w-4 mr-2" />
        Dashboard
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <Plus className="h-4 w-4 mr-2" />
        Add Measurement
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <TrendingUp className="h-4 w-4 mr-2" />
        My Progress
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <Award className="h-4 w-4 mr-2" />
        Achievements
      </Button>
    </nav>
  );

  const handleAddMeasurement = () => {
    console.log('Adding measurement:', newMeasurement);
    // Reset form
    setNewMeasurement({
      bloodSugar: '',
      bloodPressure: '',
      oxygen: '',
      temperature: ''
    });
  };

  return (
    <DashboardLayout 
      user={user} 
      onLogout={onLogout} 
      sidebarContent={sidebarContent}
      notifications={2}
    >
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
              <p className="text-xs text-green-600">
                ↓ 5% from yesterday
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">120/80</div>
              <p className="text-xs text-green-600">
                Normal range
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oxygen Level</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-green-600">
                Excellent
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.6°F</div>
              <p className="text-xs text-green-600">
                Normal
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="measurements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="measurements">Add Measurements</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="measurements" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Measurement */}
              <Card>
                <CardHeader>
                  <CardTitle>Record Today's Measurements</CardTitle>
                  <CardDescription>
                    Enter your health measurements for today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Blood Sugar (mg/dL)</label>
                      <Input
                        type="number"
                        placeholder="120"
                        value={newMeasurement.bloodSugar}
                        onChange={(e) => setNewMeasurement({...newMeasurement, bloodSugar: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Blood Pressure</label>
                      <Input
                        placeholder="120/80"
                        value={newMeasurement.bloodPressure}
                        onChange={(e) => setNewMeasurement({...newMeasurement, bloodPressure: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Oxygen Level (%)</label>
                      <Input
                        type="number"
                        placeholder="98"
                        value={newMeasurement.oxygen}
                        onChange={(e) => setNewMeasurement({...newMeasurement, oxygen: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Temperature (°F)</label>
                      <Input
                        type="number"
                        placeholder="98.6"
                        step="0.1"
                        value={newMeasurement.temperature}
                        onChange={(e) => setNewMeasurement({...newMeasurement, temperature: e.target.value})}
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
                  <CardDescription>
                    Track your progress towards weekly health goals
                  </CardDescription>
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
                      You've logged {weeklyProgress} out of {weeklyGoal} measurements this week. 
                      Keep going to maintain your streak!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Streak:</span>
                        <div className="font-medium">{currentStreak} days</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Points:</span>
                        <div className="font-medium">{totalPoints}</div>
                      </div>
                    </div>
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
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>Track your health journey over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{currentStreak}</div>
                    <p className="text-sm text-blue-600">Day Streak</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
                    <p className="text-sm text-green-600">Total Points</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">85%</div>
                    <p className="text-sm text-purple-600">Goals Met</p>
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
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>Unlock badges by maintaining healthy habits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`p-4 rounded-lg border ${
                        achievement.earned 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            achievement.earned ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-sm ${
                            achievement.earned ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.earned && (
                          <Badge className="bg-green-100 text-green-800">Earned</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
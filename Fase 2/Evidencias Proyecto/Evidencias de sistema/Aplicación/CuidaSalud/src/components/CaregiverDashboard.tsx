import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Users, 
  Bell, 
  Plus, 
  Heart,
  AlertTriangle,
  Settings,
  UserCheck,
  Clock,
  Activity
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface CaregiverDashboardProps {
  user: User;
  onLogout: () => void;
}

// Mock data
const assignedPatients = [
  { 
    id: 1, 
    name: 'Eleanor Smith', 
    age: 78, 
    condition: 'Diabetes', 
    lastUpdate: '2 hours ago',
    status: 'stable',
    nextAppointment: '2024-01-25',
    alerts: 1
  },
  { 
    id: 2, 
    name: 'Robert Johnson', 
    age: 65, 
    condition: 'Hypertension', 
    lastUpdate: '4 hours ago',
    status: 'attention_needed',
    nextAppointment: '2024-01-23',
    alerts: 2
  },
  { 
    id: 3, 
    name: 'Mary Wilson', 
    age: 72, 
    condition: 'Heart Disease', 
    lastUpdate: '1 hour ago',
    status: 'stable',
    nextAppointment: '2024-01-28',
    alerts: 0
  }
];

const notifications = [
  {
    id: 1,
    type: 'critical',
    message: 'Robert Johnson - Blood pressure reading of 180/110 recorded',
    time: '10 minutes ago',
    patient: 'Robert Johnson'
  },
  {
    id: 2,
    type: 'warning',
    message: 'Eleanor Smith - Missed medication reminder',
    time: '1 hour ago',
    patient: 'Eleanor Smith'
  },
  {
    id: 3,
    type: 'info',
    message: 'Mary Wilson - Successfully logged daily measurements',
    time: '2 hours ago',
    patient: 'Mary Wilson'
  }
];

export function CaregiverDashboard({ user, onLogout }: CaregiverDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [newMeasurement, setNewMeasurement] = useState({
    patientId: '',
    type: '',
    value: '',
    notes: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    criticalAlerts: true,
    medicationReminders: true,
    appointmentReminders: true,
    dailyReports: false
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'outline';
      case 'attention_needed': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const sidebarContent = (
    <nav className="space-y-2">
      <Button variant="default" className="w-full justify-start">
        <Users className="h-4 w-4 mr-2" />
        My Patients
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <Plus className="h-4 w-4 mr-2" />
        Add Data
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <Bell className="h-4 w-4 mr-2" />
        Notifications
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <Settings className="h-4 w-4 mr-2" />
        Preferences
      </Button>
    </nav>
  );

  const handleAddMeasurement = () => {
    console.log('Adding measurement:', newMeasurement);
    setNewMeasurement({
      patientId: '',
      type: '',
      value: '',
      notes: ''
    });
  };

  return (
    <DashboardLayout 
      user={user} 
      onLogout={onLogout} 
      sidebarContent={sidebarContent}
      notifications={notifications.length}
    >
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Caregiver Dashboard</h2>
          <p className="text-gray-600">Monitor and support your assigned patients</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedPatients.length}</div>
              <p className="text-xs text-muted-foreground">
                Active under your care
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {notifications.filter(n => n.type === 'critical').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                2 completed, 3 pending
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="patients">My Patients</TabsTrigger>
            <TabsTrigger value="data-entry">Data Entry</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Patients</CardTitle>
                <CardDescription>
                  Patients under your care and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignedPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{patient.name}</h4>
                          <p className="text-sm text-gray-600">
                            Age {patient.age} • {patient.condition}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last update: {patient.lastUpdate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {patient.alerts > 0 && (
                          <Badge variant="destructive">
                            {patient.alerts} alert{patient.alerts !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        <Badge variant={getStatusColor(patient.status) as any}>
                          {patient.status.replace('_', ' ')}
                        </Badge>
                        <div className="text-right text-sm">
                          <p className="text-gray-600">Next appointment</p>
                          <p className="font-medium">{patient.nextAppointment}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPatient(patient.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-entry" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Record Patient Data</CardTitle>
                <CardDescription>
                  Enter health measurements on behalf of your patients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Patient</label>
                    <Select 
                      value={newMeasurement.patientId} 
                      onValueChange={(value) => setNewMeasurement({...newMeasurement, patientId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignedPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Measurement Type</label>
                    <Select 
                      value={newMeasurement.type} 
                      onValueChange={(value) => setNewMeasurement({...newMeasurement, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blood_sugar">Blood Sugar</SelectItem>
                        <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                        <SelectItem value="oxygen">Oxygen Level</SelectItem>
                        <SelectItem value="temperature">Temperature</SelectItem>
                        <SelectItem value="weight">Weight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <Input
                    placeholder="Enter measurement value"
                    value={newMeasurement.value}
                    onChange={(e) => setNewMeasurement({...newMeasurement, value: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Input
                    placeholder="Additional notes or observations"
                    value={newMeasurement.notes}
                    onChange={(e) => setNewMeasurement({...newMeasurement, notes: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handleAddMeasurement} 
                  className="w-full"
                  disabled={!newMeasurement.patientId || !newMeasurement.type || !newMeasurement.value}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record Measurement
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Data Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { patient: 'Eleanor Smith', type: 'Blood Sugar', value: '140 mg/dL', time: '1 hour ago' },
                    { patient: 'Robert Johnson', type: 'Blood Pressure', value: '160/95', time: '2 hours ago' },
                    { patient: 'Mary Wilson', type: 'Temperature', value: '98.6°F', time: '3 hours ago' }
                  ].map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{entry.patient}</h4>
                        <p className="text-sm text-gray-600">{entry.type}: {entry.value}</p>
                      </div>
                      <p className="text-sm text-gray-500">{entry.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Center</CardTitle>
                <CardDescription>
                  Stay updated on patient alerts and important events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {notification.type === 'critical' && (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {notification.type === 'warning' && (
                          <Bell className="h-5 w-5 text-yellow-500" />
                        )}
                        {notification.type === 'info' && (
                          <Activity className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Badge variant={getNotificationColor(notification.type) as any}>
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                        <p className="text-sm mt-1">{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure which alerts and notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Critical Alerts</h4>
                    <p className="text-sm text-gray-600">Immediate notifications for critical patient conditions</p>
                  </div>
                  <Switch
                    checked={notificationSettings.criticalAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, criticalAlerts: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Medication Reminders</h4>
                    <p className="text-sm text-gray-600">Alerts when patients miss medications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.medicationReminders}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, medicationReminders: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Appointment Reminders</h4>
                    <p className="text-sm text-gray-600">Upcoming appointment notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.appointmentReminders}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, appointmentReminders: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Daily Reports</h4>
                    <p className="text-sm text-gray-600">Daily summary of patient activities</p>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, dailyReports: checked})
                    }
                  />
                </div>

                <Button className="w-full mt-4">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
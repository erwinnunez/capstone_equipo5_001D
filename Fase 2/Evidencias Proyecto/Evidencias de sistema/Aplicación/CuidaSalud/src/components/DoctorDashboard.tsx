import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

// Mock data
const patients = [
  { id: 1, name: 'John Smith', age: 65, condition: 'Diabetes', riskLevel: 'high', lastReading: '2 hours ago', alerts: 3 },
  { id: 2, name: 'Maria Garcia', age: 58, condition: 'Hypertension', riskLevel: 'medium', lastReading: '4 hours ago', alerts: 1 },
  { id: 3, name: 'Robert Johnson', age: 72, condition: 'Heart Disease', riskLevel: 'high', lastReading: '1 hour ago', alerts: 2 },
  { id: 4, name: 'Lisa Brown', age: 45, condition: 'Diabetes', riskLevel: 'low', lastReading: '6 hours ago', alerts: 0 },
  { id: 5, name: 'David Wilson', age: 63, condition: 'Hypertension', riskLevel: 'medium', lastReading: '3 hours ago', alerts: 1 }
];

const chartData = [
  { date: '2024-01-15', bloodSugar: 120, bloodPressure: 140, temperature: 98.6 },
  { date: '2024-01-16', bloodSugar: 135, bloodPressure: 145, temperature: 99.1 },
  { date: '2024-01-17', bloodSugar: 110, bloodPressure: 138, temperature: 98.4 },
  { date: '2024-01-18', bloodSugar: 125, bloodPressure: 142, temperature: 98.8 },
  { date: '2024-01-19', bloodSugar: 140, bloodPressure: 150, temperature: 99.2 },
  { date: '2024-01-20', bloodSugar: 118, bloodPressure: 136, temperature: 98.5 }
];

const alertData = [
  { type: 'Critical', count: 5, color: '#ef4444' },
  { type: 'Warning', count: 12, color: '#f59e0b' },
  { type: 'Normal', count: 28, color: '#10b981' }
];

export function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || patient.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const sidebarContent = (
    <nav className="space-y-2">
      <Button variant="default" className="w-full justify-start">
        <Users className="h-4 w-4 mr-2" />
        Patients
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <AlertTriangle className="h-4 w-4 mr-2" />
        Alerts
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <TrendingUp className="h-4 w-4 mr-2" />
        Analytics
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <FileText className="h-4 w-4 mr-2" />
        Reports
      </Button>
    </nav>
  );

  return (
    <DashboardLayout 
      user={user} 
      onLogout={onLogout} 
      sidebarContent={sidebarContent}
      notifications={8}
    >
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Doctor Dashboard</h2>
          <p className="text-gray-600">Monitor patients, review alerts, and manage care protocols</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">5</div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                33% of total patients
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="patients">Patient Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Patient List</CardTitle>
                <CardDescription>
                  Monitor and manage patient health status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Patient List */}
                <div className="space-y-3">
                  {filteredPatients.map((patient) => (
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
                            Last reading: {patient.lastReading}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {patient.alerts > 0 && (
                          <Badge variant="destructive">
                            {patient.alerts} alert{patient.alerts !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        <Badge variant={getRiskColor(patient.riskLevel) as any}>
                          {patient.riskLevel} risk
                        </Badge>
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

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Trends (30 days)</CardTitle>
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
                  <CardTitle>Alert Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={alertData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill={(entry) => entry.color} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>
                  Create comprehensive patient reports for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Report Type</label>
                    <Select defaultValue="patient">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient Summary</SelectItem>
                        <SelectItem value="alerts">Alert Analysis</SelectItem>
                        <SelectItem value="trends">Trend Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Select defaultValue="30days">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Format</label>
                    <Select defaultValue="pdf">
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
                <Button className="w-full md:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Patient Summary Report - January 2024', date: '2024-01-20', format: 'PDF' },
                    { name: 'Alert Analysis - Week 3', date: '2024-01-18', format: 'Excel' },
                    { name: 'Trend Analysis - Q1 2024', date: '2024-01-15', format: 'PDF' }
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-gray-600">{report.date} • {report.format}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
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
// src/data/adminMock.ts
export const systemUsers = [
  { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.j@hospital.com', role: 'doctor',   status: 'active',   lastLogin: '2024-01-20' },
  { id: 2, name: 'Nurse Mary Smith',  email: 'mary.s@hospital.com',  role: 'caregiver',status: 'active',   lastLogin: '2024-01-20' },
  { id: 3, name: 'John Doe',          email: 'john.d@email.com',     role: 'patient',  status: 'active',   lastLogin: '2024-01-19' },
  { id: 4, name: 'Dr. Michael Brown', email: 'michael.b@hospital.com', role:'doctor',  status: 'inactive', lastLogin: '2024-01-15' },
  { id: 5, name: 'Lisa Wilson',       email: 'lisa.w@email.com',     role: 'patient',  status: 'active',   lastLogin: '2024-01-20' }
];

export const auditLogs = [
  { id: 1, user: 'Dr. Sarah Johnson',  action: 'Updated patient threshold', timestamp: '2024-01-20 14:30', resource: 'Patient #1234' },
  { id: 2, user: 'Nurse Mary Smith',   action: 'Added patient measurement', timestamp: '2024-01-20 13:45', resource: 'Patient #5678' },
  { id: 3, user: 'System',             action: 'Alert triggered',           timestamp: '2024-01-20 13:20', resource: 'Critical BP reading' },
  { id: 4, user: 'John Doe',           action: 'Logged measurement',        timestamp: '2024-01-20 12:15', resource: 'Self-entry' },
  { id: 5, user: 'Admin User',         action: 'Created new user account',  timestamp: '2024-01-20 10:30', resource: 'Dr. Michael Brown' }
];

export const systemStats = [
  { name: 'Doctors',   count: 12,  color: '#3b82f6' },
  { name: 'Caregivers',count: 28,  color: '#10b981' },
  { name: 'Patients',  count: 156, color: '#f59e0b' },
  { name: 'Admins',    count: 3,   color: '#ef4444' }
];

export const activityData = [
  { date: '2024-01-15', logins: 45, measurements: 89,  alerts: 12 },
  { date: '2024-01-16', logins: 52, measurements: 94,  alerts: 8  },
  { date: '2024-01-17', logins: 48, measurements: 87,  alerts: 15 },
  { date: '2024-01-18', logins: 58, measurements: 102, alerts: 6  },
  { date: '2024-01-19', logins: 44, measurements: 78,  alerts: 11 },
  { date: '2024-01-20', logins: 61, measurements: 115, alerts: 9  }
];

// src/data/caregiverMock.ts
export type AssignedPatient = {
  id: number;
  name: string;
  age: number;
  condition: string;
  lastUpdate: string;
  status: "stable" | "attention_needed" | "critical";
  nextAppointment: string;
  alerts: number;
};

export type CareNotification = {
  id: number;
  type: "critical" | "warning" | "info";
  message: string;
  time: string;
  patient: string;
};

export const assignedPatients: AssignedPatient[] = [
  { id: 1, name: "Eleanor Smith", age: 78, condition: "Diabetes",      lastUpdate: "2 hours ago", status: "stable",           nextAppointment: "2024-01-25", alerts: 1 },
  { id: 2, name: "Robert Johnson", age: 65, condition: "Hypertension", lastUpdate: "4 hours ago", status: "attention_needed", nextAppointment: "2024-01-23", alerts: 2 },
  { id: 3, name: "Mary Wilson",    age: 72, condition: "Heart Disease",lastUpdate: "1 hour ago",  status: "stable",           nextAppointment: "2024-01-28", alerts: 0 },
];

export const notifications: CareNotification[] = [
  { id: 1, type: "critical", message: "Robert Johnson - Blood pressure reading of 180/110 recorded", time: "10 minutes ago", patient: "Robert Johnson" },
  { id: 2, type: "warning",  message: "Eleanor Smith - Missed medication reminder",                   time: "1 hour ago",     patient: "Eleanor Smith"  },
  { id: 3, type: "info",     message: "Mary Wilson - Successfully logged daily measurements",        time: "2 hours ago",    patient: "Mary Wilson"    },
];

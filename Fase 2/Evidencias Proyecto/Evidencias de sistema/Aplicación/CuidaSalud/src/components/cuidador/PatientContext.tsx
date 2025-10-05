// src/components/cuidador/PatientContext.tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Patient = {
  id: string;
  name: string;
  age: number;
  condition: string;
  emergencyContact: string;
  emergencyPhone: string;
  medications: string[];
  allergies: string[];
  notes: string;
  createdAt: Date;
};

export type NewPatient = {
  name: string;
  age: number;
  condition: string;
  emergencyContact: string;
  emergencyPhone: string;
  medications: string[];
  allergies: string[];
  notes: string;
};

type PatientsContextValue = {
  patients: Patient[];
  selectedPatientId: string | null;
  selectPatient: (id: string) => void;
  addPatient: (p: NewPatient) => void;
  updatePatient: (id: string, patch: NewPatient) => void;
  deletePatient: (id: string) => void;
};

const PatientsContext = createContext<PatientsContextValue | null>(null);

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2);

const SEED: Patient[] = [
  {
    id: makeId(),
    name: "Paciente Demo",
    age: 70,
    condition: "Hipertensión",
    emergencyContact: "Hija - Ana",
    emergencyPhone: "+56 9 1234 5678",
    medications: ["Losartán 50mg", "Aspirina 100mg"],
    allergies: ["Penicilina"],
    notes: "Control mensual. Registrar PA a diario.",
    createdAt: new Date(),
  },
];

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(SEED);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id ?? null);

  const value = useMemo<PatientsContextValue>(() => {
    const addPatient = (p: NewPatient) => {
      const newPatient: Patient = {
        id: makeId(),
        createdAt: new Date(),
        ...p,
      };
      setPatients((prev) => [newPatient, ...prev]);
      setSelectedPatientId(newPatient.id);
    };

    const updatePatient = (id: string, patch: NewPatient) => {
      setPatients((prev) =>
        prev.map((pt) => (pt.id === id ? { ...pt, ...patch } as Patient : pt))
      );
    };

    const deletePatient = (id: string) => {
      setPatients((prev) => prev.filter((pt) => pt.id !== id));
      setSelectedPatientId((curr) => (curr === id ? null : curr));
    };

    const selectPatient = (id: string) => setSelectedPatientId(id);

    return { patients, selectedPatientId, selectPatient, addPatient, updatePatient, deletePatient };
  }, [patients, selectedPatientId]);

  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>;
}

export function usePatients() {
  const ctx = useContext(PatientsContext);
  if (!ctx) throw new Error("usePatients must be used within a PatientsProvider");
  return ctx;
}

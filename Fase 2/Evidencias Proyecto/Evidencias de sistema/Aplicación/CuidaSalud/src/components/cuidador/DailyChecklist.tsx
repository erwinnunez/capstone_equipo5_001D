// src/components/cuidador/DailyChecklist.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Clock, Plus, Save, Calendar } from "lucide-react";
import { usePatients } from "./PatientContext.tsx";
import { NoPatientSelected } from "./NoPatientSelected.tsx";

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  time?: string;
  notes?: string;
  category: "medication" | "vitals" | "care" | "therapy";
}

const defaultDailyTasks: ChecklistItem[] = [
  { id: "1", task: "Tomar presión arterial", completed: false, time: "08:00", category: "vitals" },
  { id: "2", task: "Administrar medicación matutina", completed: false, time: "08:30", category: "medication" },
  { id: "3", task: "Desayuno y hidratación", completed: false, time: "09:00", category: "care" },
  { id: "4", task: "Ejercicios de rehabilitación", completed: false, time: "10:00", category: "therapy" },
  { id: "5", task: "Medicación del mediodía", completed: false, time: "12:00", category: "medication" },
  { id: "6", task: "Control de glucosa", completed: false, time: "14:00", category: "vitals" },
  { id: "7", task: "Cuidados de heridas", completed: false, time: "15:00", category: "care" },
  { id: "8", task: "Medicación vespertina", completed: false, time: "18:00", category: "medication" },
  { id: "9", task: "Cena y medicación nocturna", completed: false, time: "20:00", category: "medication" },
];

const weeklyTasksSeed: ChecklistItem[] = [
  { id: "w1", task: "Revisión de medicamentos con farmacia", completed: false, category: "medication" },
  { id: "w2", task: "Limpieza profunda de equipos médicos", completed: false, category: "care" },
  { id: "w3", task: "Evaluación de seguridad del hogar", completed: false, category: "care" },
  { id: "w4", task: "Contacto con equipo médico", completed: false, category: "vitals" },
  { id: "w5", task: "Revisión de suministros médicos", completed: false, category: "care" },
];

export function DailyChecklist() {
  const { patients, selectedPatientId } = usePatients();
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null;

  const [dailyTasks, setDailyTasks] = useState<ChecklistItem[]>(defaultDailyTasks);
  const [weeklyTasksState, setWeeklyTasksState] = useState<ChecklistItem[]>(weeklyTasksSeed);
  const [newTask, setNewTask] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");

  const toggleTask = (id: string, isDaily: boolean = true) => {
    if (isDaily) {
      setDailyTasks((tasks) => tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    } else {
      setWeeklyTasksState((tasks) => tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    }
  };

  const addTask = (isDaily: boolean = true) => {
    if (!newTask.trim()) return;

    const newTaskItem: ChecklistItem = {
      id: Date.now().toString(),
      task: newTask,
      completed: false,
      time: newTaskTime || undefined,
      category: "care",
    };

    if (isDaily) setDailyTasks((tasks) => [...tasks, newTaskItem]);
    else setWeeklyTasksState((tasks) => [...tasks, newTaskItem]);

    setNewTask("");
    setNewTaskTime("");
  };

  const updateNotes = (id: string, notes: string, isDaily: boolean = true) => {
    if (isDaily) {
      setDailyTasks((tasks) => tasks.map((t) => (t.id === id ? { ...t, notes } : t)));
    } else {
      setWeeklyTasksState((tasks) => tasks.map((t) => (t.id === id ? { ...t, notes } : t)));
    }
  };

  const getCategoryBadge = (category: ChecklistItem["category"]) => {
    const configs = {
      medication: { label: "Medicación", variant: "destructive" as const },
      vitals: { label: "Signos", variant: "default" as const },
      care: { label: "Cuidados", variant: "secondary" as const },
      therapy: { label: "Terapia", variant: "outline" as const },
    };
    const c = configs[category];
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const completedDaily = dailyTasks.filter((t) => t.completed).length;
  const completedWeekly = weeklyTasksState.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {!selectedPatient && <NoPatientSelected message="Para gestionar el checklist debe seleccionar un paciente" />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Progreso del Día {selectedPatient && `- ${selectedPatient.name}`}
          </CardTitle>
          <CardDescription>
            {completedDaily} de {dailyTasks.length} tareas completadas (
            {Math.round((completedDaily / dailyTasks.length) * 100)}%)
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Rutina Diaria</TabsTrigger>
          <TabsTrigger value="weekly">Rutina Semanal</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {/* Nueva tarea diaria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Tarea
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="Nueva tarea..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1"
              />
              <Input
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                className="w-32"
              />
              <Button onClick={() => addTask(true)}>Agregar</Button>
            </CardContent>
          </Card>

          {/* Lista diaria */}
          <div className="grid gap-4">
            {dailyTasks.map((task) => (
              <Card key={task.id} className={task.completed ? "bg-muted/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id, true)} className="mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.task}</span>
                        {getCategoryBadge(task.category)}
                        {task.time && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.time}
                          </Badge>
                        )}
                      </div>
                      <Textarea
                        placeholder="Notas o observaciones..."
                        value={task.notes || ""}
                        onChange={(e) => updateNotes(task.id, e.target.value, true)}
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {/* Nueva tarea semanal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Tarea Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="Nueva tarea semanal..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => addTask(false)}>Agregar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progreso Semanal</CardTitle>
              <CardDescription>
                {completedWeekly} de {weeklyTasksState.length} tareas completadas
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Lista semanal */}
          <div className="grid gap-4">
            {weeklyTasksState.map((task) => (
              <Card key={task.id} className={task.completed ? "bg-muted/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id, false)} className="mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.task}</span>
                        {getCategoryBadge(task.category)}
                      </div>
                      <Textarea
                        placeholder="Notas o observaciones..."
                        value={task.notes || ""}
                        onChange={(e) => updateNotes(task.id, e.target.value, false)}
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="p-4">
          <Button className="w-full flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar Progreso del Día
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default DailyChecklist;

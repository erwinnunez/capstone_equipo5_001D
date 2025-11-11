import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Copy, CheckSquare, Calendar, Target, } from 'lucide-react';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  completed: boolean;
  dueDate?: string;
  priority: 'alta' | 'media' | 'baja';
}

export default function FollowUpChecklist() {
  const [checklistData, setChecklistData] = useState({
    patientName: '',
    nextAppointment: '',
    appointmentType: '',
    targetMetrics: [] as string[],
    customMetric: ''
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newTask, setNewTask] = useState({
    category: '',
    task: '',
    dueDate: '',
    priority: 'media' as 'alta' | 'media' | 'baja'
  });
  const [generatedChecklist, setGeneratedChecklist] = useState('');

  const categories = [
    'Citas Médicas',
    'Exámenes/Laboratorios',
    'Medicamentos',
    'Automonitoreo',
    'Educación al Paciente',
    'Estilo de Vida',
    'Seguimiento Telefónico'
  ];

  const commonMetrics = [
    'Presión arterial < 140/90 mmHg',
    'Glucosa en ayunas 80-130 mg/dL',
    'HbA1c < 7%',
    'Colesterol LDL < 100 mg/dL',
    'Peso corporal objetivo',
    'IMC en rango saludable',
    'Adherencia medicamentosa > 80%',
    'Ejercicio 150 min/semana',
    'Abstinencia tabáquica'
  ];

  const commonTasks = {
    'Citas Médicas': [
      'Programar cita de seguimiento',
      'Agendar interconsulta especialista',
      'Control de rutina',
      'Evaluación de laboratorios'
    ],
    'Exámenes/Laboratorios': [
      'Laboratorios de control',
      'Radiografía de seguimiento',
      'Ecocardiograma de control',
      'Mamografía anual',
      'Colonoscopia de rutina'
    ],
    'Medicamentos': [
      'Revisar adherencia medicamentosa',
      'Evaluar efectos secundarios',
      'Ajuste de dosis según evolución',
      'Renovar recetas médicas'
    ],
    'Automonitoreo': [
      'Toma diaria de presión arterial',
      'Automonitoreo de glucosa',
      'Control semanal de peso',
      'Registro de síntomas'
    ],
    'Educación al Paciente': [
      'Reforzar uso correcto de medicamentos',
      'Educación sobre dieta saludable',
      'Técnicas de manejo del estrés',
      'Reconocimiento de señales de alarma'
    ]
  };

  const addMetric = () => {
    if (checklistData.customMetric.trim() && !checklistData.targetMetrics.includes(checklistData.customMetric.trim())) {
      setChecklistData(prev => ({
        ...prev,
        targetMetrics: [...prev.targetMetrics, prev.customMetric.trim()],
        customMetric: ''
      }));
    }
  };

  const removeMetric = (index: number) => {
    setChecklistData(prev => ({
      ...prev,
      targetMetrics: prev.targetMetrics.filter((_, i) => i !== index)
    }));
  };

  const addCommonMetric = (metric: string) => {
    if (!checklistData.targetMetrics.includes(metric)) {
      setChecklistData(prev => ({
        ...prev,
        targetMetrics: [...prev.targetMetrics, metric]
      }));
    }
  };

  const addTask = () => {
    if (newTask.category && newTask.task) {
      const task: ChecklistItem = {
        id: Date.now().toString(),
        category: newTask.category,
        task: newTask.task,
        completed: false,
        dueDate: newTask.dueDate || undefined,
        priority: newTask.priority
      };
      setChecklist([...checklist, task]);
      setNewTask({
        category: '',
        task: '',
        dueDate: '',
        priority: 'media'
      });
    }
  };

  const addCommonTask = (category: string, task: string) => {
    const newTaskItem: ChecklistItem = {
      id: Date.now().toString() + Math.random(),
      category,
      task,
      completed: false,
      priority: 'media'
    };
    setChecklist([...checklist, newTaskItem]);
  };

  const toggleTask = (id: string) => {
    setChecklist(checklist.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const removeTask = (id: string) => {
    setChecklist(checklist.filter(task => task.id !== id));
  };

  const generateChecklist = () => {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const tasksByCategory = checklist.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, ChecklistItem[]>);

    const completedTasks = checklist.filter(t => t.completed).length;
    const totalTasks = checklist.length;

    const checklistDocument = `LISTA DE VERIFICACIÓN - SEGUIMIENTO
====================================

PACIENTE: ${checklistData.patientName}
FECHA DE GENERACIÓN: ${currentDate}
PRÓXIMA CITA: ${checklistData.nextAppointment}
TIPO DE CONSULTA: ${checklistData.appointmentType}

📊 PROGRESO GENERAL: ${completedTasks}/${totalTasks} tareas completadas (${Math.round((completedTasks/totalTasks)*100) || 0}%)

🎯 MÉTRICAS OBJETIVO:
${checklistData.targetMetrics.map((metric, index) => `${index + 1}. ${metric}`).join('\n')}

📋 TAREAS POR CATEGORÍA:
${Object.entries(tasksByCategory).map(([category, tasks]) => `
${category.toUpperCase()}:
${tasks.map(task => {
  const status = task.completed ? '✅' : '⬜';
  const priority = task.priority === 'alta' ? '🔴' : task.priority === 'media' ? '🟡' : '🟢';
  const dueDate = task.dueDate ? ` (Fecha límite: ${new Date(task.dueDate).toLocaleDateString('es-ES')})` : '';
  return `${status} ${priority} ${task.task}${dueDate}`;
}).join('\n')}`).join('\n')}

⚠️ TAREAS PENDIENTES DE ALTA PRIORIDAD:
${checklist.filter(t => !t.completed && t.priority === 'alta').length > 0 ? 
  checklist.filter(t => !t.completed && t.priority === 'alta').map(t => `• ${t.task}`).join('\n') :
  'Ninguna'}

📞 SEGUIMIENTO REQUERIDO:
• Llamada de seguimiento en 1 semana
• Confirmar cumplimiento de tareas pendientes
• Evaluar adherencia al tratamiento
• Revisar comprensión de instrucciones

📅 CRONOGRAMA DE SEGUIMIENTO:
• Próxima evaluación: ${checklistData.nextAppointment}
• Revisión de laboratorios: [Según indicación]
• Control telefónico: [Programar según necesidad]

💡 RECORDATORIOS PARA EL PACIENTE:
• Traer lista actualizada de medicamentos
• Reportar efectos secundarios o síntomas nuevos
• Mantener registro de automonitoreo
• Preparar preguntas para la próxima consulta

CRITERIOS PARA CONTACTO ANTES DE LA PRÓXIMA CITA:
• Aparición de señales de alarma
• Dificultades con el tratamiento
• Dudas sobre las instrucciones
• Efectos adversos significativos

---
Médico: [NOMBRE DEL MÉDICO]
Contacto: [TELÉFONO/EMAIL]
Próxima revisión: ${checklistData.nextAppointment}`;

    setGeneratedChecklist(checklistDocument);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedChecklist);
    toast.success('Lista de verificación copiada al portapapeles');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'destructive';
      case 'media': return 'secondary';
      case 'baja': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de Seguimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patientName">Nombre del Paciente</Label>
              <Input
                id="patientName"
                value={checklistData.patientName}
                onChange={(e) => setChecklistData(prev => ({ ...prev, patientName: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nextAppointment">Próxima Cita</Label>
                <Input
                  id="nextAppointment"
                  type="datetime-local"
                  value={checklistData.nextAppointment}
                  onChange={(e) => setChecklistData(prev => ({ ...prev, nextAppointment: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="appointmentType">Tipo de Consulta</Label>
                <Select
                  value={checklistData.appointmentType}
                  onValueChange={(value: string) => setChecklistData(prev => ({ ...prev, appointmentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="control">Control</SelectItem>
                    <SelectItem value="evaluacion">Evaluación</SelectItem>
                    <SelectItem value="telemedicina">Telemedicina</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Métricas Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={checklistData.customMetric}
                onChange={(e) => setChecklistData(prev => ({ ...prev, customMetric: e.target.value }))}
                placeholder="Agregar métrica personalizada"
                onKeyPress={(e) => e.key === 'Enter' && addMetric()}
              />
              <Button onClick={addMetric} size="sm">Agregar</Button>
            </div>

            <div>
              <Label className="text-sm">Métricas Comunes:</Label>
              <div className="grid gap-2 mt-2">
                {commonMetrics.map(metric => (
                  <Button
                    key={metric}
                    variant="ghost"
                    size="sm"
                    className="justify-start h-auto py-2 px-3 text-sm"
                    onClick={() => addCommonMetric(metric)}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    {metric}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Métricas Seleccionadas:</Label>
              <div className="flex flex-wrap gap-2">
                {checklistData.targetMetrics.map((metric, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeMetric(index)}>
                    {metric} ×
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Tareas de Seguimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Task */}
            <div className="grid gap-4 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value: string) => setNewTask(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridad</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: string) => setNewTask(prev => ({ ...prev, priority: value as 'alta' | 'media' | 'baja' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">🔴 Alta</SelectItem>
                      <SelectItem value="media">🟡 Media</SelectItem>
                      <SelectItem value="baja">🟢 Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Tarea</Label>
                <Input
                  value={newTask.task}
                  onChange={(e) => setNewTask(prev => ({ ...prev, task: e.target.value }))}
                  placeholder="Describir la tarea"
                />
              </div>
              <div>
                <Label>Fecha Límite (Opcional)</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <Button onClick={addTask} size="sm">Agregar Tarea</Button>
            </div>

            {/* Common Tasks */}
            {newTask.category && commonTasks[newTask.category as keyof typeof commonTasks] && (
              <div>
                <Label className="text-sm">Tareas Comunes para {newTask.category}:</Label>
                <div className="grid gap-2 mt-2">
                  {commonTasks[newTask.category as keyof typeof commonTasks].map(task => (
                    <Button
                      key={task}
                      variant="ghost"
                      size="sm"
                      className="justify-start h-auto py-2 px-3 text-sm"
                      onClick={() => addCommonTask(newTask.category, task)}
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      {task}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Task List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {checklist.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 border rounded">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                    </div>
                    <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.task}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Fecha límite: {new Date(task.dueDate).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(task.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={generateChecklist} className="w-full" disabled={!checklistData.patientName || checklist.length === 0}>
          <CheckSquare className="mr-2 h-4 w-4" />
          Generar Lista de Verificación
        </Button>
      </div>

      {/* Generated Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lista de Verificación</h3>
          {generatedChecklist && (
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
          )}
        </div>
        
        {generatedChecklist ? (
          <Card>
            <CardContent className="p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {generatedChecklist}
              </pre>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <CheckSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>La lista de verificación aparecerá aquí una vez generada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
// src/components/cuidador/DailyChecklist.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  User, 
  Utensils, 
  Pill, 
  Heart, 
  Home, 
  Activity, 
  MessageCircle, 
  ClipboardList, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  Info
} from "lucide-react";
import { usePatients } from "./PatientContext.tsx";
import { NoPatientSelected } from "./NoPatientSelected.tsx";

interface CareTask {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

interface CareCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  tasks: CareTask[];
}

const careCategories: CareCategory[] = [
  {
    id: "personal-care",
    title: "Cuidado Personal",
    icon: <User className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    tasks: [
      {
        id: "pc1",
        title: "Aseo personal diario",
        description: "Ayudar con baño, cepillado de dientes, peinado, afeitado y cambio de ropa",
        icon: <User className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "pc2", 
        title: "Asistencia en el baño",
        description: "Ayudar en el uso del baño o cambio de pañales según necesidad",
        icon: <User className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "pc3",
        title: "Cuidado de la piel",
        description: "Mantener piel limpia y seca, aplicar cremas según indicación médica",
        icon: <User className="h-4 w-4" />,
        completed: false,
        priority: "medium"
      },
      {
        id: "pc4",
        title: "Vestimenta adecuada",
        description: "Asegurar que el paciente esté vestido apropiadamente según el clima",
        icon: <User className="h-4 w-4" />,
        completed: false,
        priority: "low"
      }
    ]
  },
  {
    id: "nutrition",
    title: "Alimentación",
    icon: <Utensils className="h-5 w-5" />,
    color: "bg-green-100 text-green-700 border-green-200",
    tasks: [
      {
        id: "n1",
        title: "Preparar comidas equilibradas",
        description: "Seguir dieta prescrita (diabética, baja en sodio, blanda, etc.)",
        icon: <Utensils className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "n2",
        title: "Asistencia en alimentación",
        description: "Ayudar a alimentar si hay movilidad o coordinación reducida",
        icon: <Utensils className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "n3",
        title: "Control de hidratación",
        description: "Controlar ingesta de líquidos para evitar deshidratación",
        icon: <Utensils className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "n4",
        title: "Registro de alimentación",
        description: "Anotar lo que come y bebe si el médico lo requiere",
        icon: <ClipboardList className="h-4 w-4" />,
        completed: false,
        priority: "medium"
      }
    ]
  },
  {
    id: "medication",
    title: "Medicación",
    icon: <Pill className="h-5 w-5" />,
    color: "bg-red-100 text-red-700 border-red-200",
    tasks: [
      {
        id: "m1",
        title: "Administrar medicamentos",
        description: "Dar medicación a hora correcta y dosis indicada",
        icon: <Pill className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "m2",
        title: "Revisar efectos secundarios",
        description: "Observar interacciones o efectos adversos visibles",
        icon: <Pill className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "m3",
        title: "Registro de medicación",
        description: "Mantener registro diario de medicamentos administrados",
        icon: <ClipboardList className="h-4 w-4" />,
        completed: false,
        priority: "medium"
      },
      {
        id: "m4",
        title: "Comunicar anomalías",
        description: "Avisar al médico sobre olvidos o reacciones adversas",
        icon: <AlertTriangle className="h-4 w-4" />,
        completed: false,
        priority: "high"
      }
    ]
  },
  {
    id: "vital-signs",
    title: "Signos Vitales",
    icon: <Heart className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    tasks: [
      {
        id: "vs1",
        title: "Tomar signos vitales",
        description: "Medir presión arterial, temperatura, frecuencia cardíaca, glucosa, saturación",
        icon: <Heart className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "vs2",
        title: "Observar cambios",
        description: "Detectar cambios físicos o anímicos (fatiga, dolor, confusión, etc.)",
        icon: <Heart className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "vs3",
        title: "Reportar anomalías",
        description: "Informar cualquier anomalía al personal médico o familiares",
        icon: <AlertTriangle className="h-4 w-4" />,
        completed: false,
        priority: "high"
      }
    ]
  },
  {
    id: "environment",
    title: "Entorno y Limpieza",
    icon: <Home className="h-5 w-5" />,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    tasks: [
      {
        id: "e1",
        title: "Mantener espacio seguro",
        description: "Espacio limpio, ordenado y seguro para evitar caídas",
        icon: <Home className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "e2",
        title: "Cambiar ropa de cama",
        description: "Cambiar sábanas, toallas y ropa de cama regularmente",
        icon: <Home className="h-4 w-4" />,
        completed: false,
        priority: "medium"
      },
      {
        id: "e3",
        title: "Desinfectar utensilios",
        description: "Limpiar utensilios médicos y superficies de uso frecuente",
        icon: <Home className="h-4 w-4" />,
        completed: false,
        priority: "medium"
      },
      {
        id: "e4",
        title: "Ventilación e iluminación",
        description: "Garantizar buena ventilación e iluminación adecuada",
        icon: <Home className="h-4 w-4" />,
        completed: false,
        priority: "low"
      }
    ]
  },
  {
    id: "mobility",
    title: "Movilización y Ejercicio",
    icon: <Activity className="h-5 w-5" />,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    tasks: [
      {
        id: "mo1",
        title: "Asistir movilización",
        description: "Ayudar a levantarse, caminar o moverse para prevenir úlceras",
        icon: <Activity className="h-4 w-4" />,
        completed: false,
        priority: "high"
      },
      {
        id: "mo2",
        title: "Ejercicios de rehabilitación",
        description: "Realizar ejercicios según indicación del fisioterapeuta",
        icon: <Activity className="h-4 w-4" />,
        completed: false,
        priority: "medium"
      },
      {
        id: "mo3",
        title: "Uso correcto de ayudas",
        description: "Asegurar uso correcto de sillas de ruedas, bastones o andadores",
        icon: <Activity className="h-4 w-4" />,
        completed: false,
        priority: "medium"
      }
    ]
  },
  {
    id: "emotional",
    title: "Acompañamiento Emocional",
    icon: <MessageCircle className="h-5 w-5" />,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    tasks: [
      {
        id: "em1",
        title: "Mantener conversación",
        description: "Conversar y mantener al paciente mentalmente activo",
        icon: <MessageCircle className="h-4 w-4" />,
        completed: false,
        priority: "medium"
      },
      {
        id: "em2",
        title: "Actividades recreativas",
        description: "Fomentar lectura, música, películas, juegos simples",
        icon: <MessageCircle className="h-4 w-4" />,
        completed: false,
        priority: "low"
      },
      {
        id: "em3",
        title: "Mostrar empatía",
        description: "Demostrar paciencia, empatía y respeto en todo momento",
        icon: <MessageCircle className="h-4 w-4" />,
        completed: false,
        priority: "medium"
      },
      {
        id: "em4",
        title: "Facilitar contacto social",
        description: "Evitar aislamiento, facilitar llamadas o visitas familiares",
        icon: <MessageCircle className="h-4 w-4" />,
        completed: false,
        priority: "medium"
      }
    ]
  }
];

export function DailyChecklist() {
  const { patients, selectedPatientId } = usePatients();
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null;

  const [categories, setCategories] = useState<CareCategory[]>(careCategories);
  const [activeTab, setActiveTab] = useState("overview");

  const toggleTask = (categoryId: string, taskId: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              tasks: category.tasks.map(task => 
                task.id === taskId 
                  ? { ...task, completed: !task.completed }
                  : task
              )
            }
          : category
      )
    );
  };

  const getTotalTasks = () => {
    return categories.reduce((total, category) => total + category.tasks.length, 0);
  };

  const getCompletedTasks = () => {
    return categories.reduce((total, category) => 
      total + category.tasks.filter(task => task.completed).length, 0
    );
  };

  const getCategoryProgress = (category: CareCategory) => {
    const completed = category.tasks.filter(task => task.completed).length;
    const total = category.tasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    const configs = {
      high: { label: "Alta", variant: "destructive" as const },
      medium: { label: "Media", variant: "default" as const },
      low: { label: "Baja", variant: "secondary" as const },
    };
    return <Badge variant={configs[priority].variant} className="text-xs">{configs[priority].label}</Badge>;
  };

  const completedTasks = getCompletedTasks();
  const totalTasks = getTotalTasks();
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {!selectedPatient && <NoPatientSelected message="Para ver las guías de cuidado debe seleccionar un paciente" />}

      {/* Header con progreso general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Guía de Cuidados Diarios {selectedPatient && `- ${selectedPatient.name}`}
          </CardTitle>
          <CardDescription>
            {completedTasks} de {totalTasks} tareas completadas ({overallProgress}%)
          </CardDescription>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </CardHeader>
      </Card>

      {/* Card separada SOLO para las opciones de navegación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Opciones de Vista</CardTitle>
          <CardDescription>
            Selecciona cómo quieres ver las tareas de cuidado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">📊 Resumen</TabsTrigger>
              <TabsTrigger value="categories" className="text-xs sm:text-sm">📂 Por Categorías</TabsTrigger>
              <TabsTrigger value="priority" className="text-xs sm:text-sm">🔥 Por Prioridad</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Card separada para el contenido según la vista seleccionada */}
      <Card>
        <CardContent className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => {
                  const progress = getCategoryProgress(category);
                  return (
                    <Card key={category.id} className={`border-2 ${category.color}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          {category.icon}
                          {category.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {progress.completed} de {progress.total} tareas ({progress.percentage}%)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-current h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {category.tasks.filter(t => !t.completed).length} pendientes
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Tareas pendientes de alta prioridad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Tareas Prioritarias Pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.flatMap(category => 
                      category.tasks
                        .filter(task => task.priority === "high" && !task.completed)
                        .map(task => (
                          <div key={task.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <Checkbox 
                              checked={task.completed}
                              onCheckedChange={() => toggleTask(category.id, task.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {task.icon}
                                <span className="font-medium text-sm">{task.title}</span>
                                {getPriorityBadge(task.priority)}
                              </div>
                              <p className="text-xs text-muted-foreground">{task.description}</p>
                              <Badge variant="outline" className="mt-1 text-xs">{category.title}</Badge>
                            </div>
                          </div>
                        ))
                    )}
                    {categories.flatMap(category => 
                      category.tasks.filter(task => task.priority === "high" && !task.completed)
                    ).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        ¡Excelente! Todas las tareas de alta prioridad están completadas
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-4">
              {categories.map((category) => (
                <Card key={category.id} className={`border-2 ${category.color}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {category.icon}
                      {category.title}
                    </CardTitle>
                    <CardDescription>
                      {getCategoryProgress(category).completed} de {getCategoryProgress(category).total} tareas completadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.tasks.map((task) => (
                        <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                          task.completed ? 'bg-muted/50 border-muted' : 'bg-background border-border'
                        }`}>
                          <Checkbox 
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(category.id, task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {task.icon}
                              <span className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </span>
                              {getPriorityBadge(task.priority)}
                            </div>
                            <p className={`text-xs ${task.completed ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                              {task.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "priority" && (
            <div className="space-y-4">
              {(["high", "medium", "low"] as const).map((priority) => {
                const priorityTasks = categories.flatMap(category => 
                  category.tasks
                    .filter(task => task.priority === priority)
                    .map(task => ({ ...task, categoryTitle: category.title, categoryId: category.id }))
                );

                const priorityConfig = {
                  high: { title: "Alta Prioridad", color: "border-red-200 bg-red-50", icon: <AlertTriangle className="h-5 w-5 text-red-500" /> },
                  medium: { title: "Prioridad Media", color: "border-yellow-200 bg-yellow-50", icon: <Clock className="h-5 w-5 text-yellow-500" /> },
                  low: { title: "Prioridad Baja", color: "border-green-200 bg-green-50", icon: <Info className="h-5 w-5 text-green-500" /> }
                };

                return (
                  <Card key={priority} className={`border-2 ${priorityConfig[priority].color}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {priorityConfig[priority].icon}
                        {priorityConfig[priority].title}
                      </CardTitle>
                      <CardDescription>
                        {priorityTasks.filter(t => t.completed).length} de {priorityTasks.length} tareas completadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {priorityTasks.map((task) => (
                          <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                            task.completed ? 'bg-muted/50 border-muted' : 'bg-background border-border'
                          }`}>
                            <Checkbox 
                              checked={task.completed}
                              onCheckedChange={() => toggleTask(task.categoryId, task.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {task.icon}
                                <span className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </span>
                                <Badge variant="outline" className="text-xs">{task.categoryTitle}</Badge>
                              </div>
                              <p className={`text-xs ${task.completed ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                                {task.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DailyChecklist;

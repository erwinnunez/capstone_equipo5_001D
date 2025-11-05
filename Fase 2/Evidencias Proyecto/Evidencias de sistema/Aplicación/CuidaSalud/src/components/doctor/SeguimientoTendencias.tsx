// src/components/SeguimientoTendencia.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Progress } from "../ui/progress";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  ClipboardList,
  Edit,
  Plus,
  Save,
  Target,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";

//imports especiales
import { DialogContentGrande } from "../ui/dialog-grande";
import {
  getPacienteResumen,
  getPacienteMetricas,
} from "../../services/paciente";
import {
  createRangoPaciente,
  updateRangoPaciente,
  deleteRangoPaciente,
} from "../../services/rangoPaciente";
import {
  listParametrosClinicos,
  type ParametroClinicoOut,
} from "../../services/parametroClinico";
import {
  listTareasPaciente,
  createTarea,
  deleteTarea,
  updateTarea,
  type TareaOut,
} from "../../services/tareas";

interface Metrica {
  id: string;
  nombre: string;
  rangoMin: string;
  rangoMax: string;
  unidad: string;
  valorActual?: string;
  cumple?: boolean;
}


interface MetricaComun {
  id_parametro: number;
  nombre: string;
  rangoMin: string;
  rangoMax: string;
  unidad: string;
}

// Métricas comunes predefinidas con rangos estándar

export default function SeguimientoTendencias() {
  // Datos del paciente
  const [rutInput, setRutInput] = useState<string>("");
  const [rut, setRut] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [enfermedadPrincipal, setEnfermedadPrincipal] = useState("");
  const [ultimaAtencion, setUltimaAtencion] = useState("");
  const [proximaCita, setProximaCita] = useState("");

  // Métricas objetivo
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [metricasDisponibles, setMetricasDisponibles] = useState<
    ParametroClinicoOut[]
  >([]);

  useEffect(() => {
    async function cargarParametrosClinicos() {
      try {
        const res = await listParametrosClinicos({ page_size: 100 });
        setMetricasDisponibles(res.items);
      } catch (err) {
        console.error("Error al cargar parámetros clínicos:", err);
        toast.error("No se pudieron cargar las métricas disponibles");
      }
    }

    cargarParametrosClinicos();
  }, []);

  function normalizeRutToNumber(input: string): number {
    // Elimina todo lo que no sea número; si tu BD guarda el RUT sin dígito verificador,
    // y el usuario escribe con DV, ajusta aquí si necesitas .slice(0, -1)
    const digits = input.replace(/\D/g, "");
    return Number(digits);
  }

  async function cargarDatosPaciente() {
    try {
      const rutNumber = normalizeRutToNumber(rutInput);
      if (!rutNumber || Number.isNaN(rutNumber)) {
        toast.error("Ingrese un RUT válido");
        return;
      }
      // (opcional) guardar el rut numérico en estado
      setRut(rutNumber);

      // 1) Resumen
      const resumen = await getPacienteResumen(rutNumber);
      setNombre(resumen.nombre_completo);
      setEdad(resumen.edad.toString());
      setEnfermedadPrincipal(resumen.enfermedad_principal || "Sin información");
      setUltimaAtencion(
        resumen.ultima_atencion
          ? new Date(resumen.ultima_atencion).toLocaleDateString("es-CL")
          : "Sin registro"
      );

      // 2) Métricas
      const metricasApi = await getPacienteMetricas(rutNumber);
      console.log("🔍 metricasApi:", metricasApi);
      const adaptadas = metricasApi.map((m) => ({
        id: m.id_rango ? m.id_rango.toString() : m.id_parametro.toString(),
        nombre: m.nombre,
        rangoMin: String(m.rango_min),
        rangoMax: String(m.rango_max),
        unidad: m.unidad, // asegúrate de que el backend devuelva unidad_medida.codigo
        valorActual:
          typeof m.valor_actual === "number" ? String(m.valor_actual) : "",
        cumple:
          typeof m.valor_actual === "number" &&
          m.valor_actual >= m.rango_min &&
          m.valor_actual <= m.rango_max
            ? true
            : false,
      }));
      setMetricas(adaptadas);

      // 3) Tareas
      const tareasApi = await listTareasPaciente(rutNumber);
      setTareas(tareasApi);

      toast.success("Datos del paciente cargados");
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar los datos del paciente");
    }
  }

  const [editandoMetricas, setEditandoMetricas] = useState(false);
  const [modalMetricasAbiertas, setModalMetricasAbiertas] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>("Todas");

  // Tareas de seguimiento
  const [tareas, setTareas] = useState<TareaOut[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState("");

  // Calcular estadísticas
  const tareasCompletadas = tareas.filter((t) => t.completado).length;
  const tareasPendientes = tareas.filter((t) => !t.completado).length;
  const porcentajeTareas =
    tareas.length > 0
      ? Math.round((tareasCompletadas / tareas.length) * 100)
      : 0;

  const metricasCumplen = metricas.filter((m) => m.cumple).length;
  const metricasNoCumplen = metricas.filter((m) => !m.cumple).length;
  const porcentajeMetricas =
    metricas.length > 0
      ? Math.round((metricasCumplen / metricas.length) * 100)
      : 0;

  const handleGuardarMetricas = async () => {
    if (!rut) return;

    try {
      for (const m of metricas) {
        await updateRangoPaciente(Number(m.id), {
          min_normal: Number(m.rangoMin),
          max_normal: Number(m.rangoMax),
        });
      }

      toast.success("Métricas actualizadas correctamente");
      setEditandoMetricas(false);
      await cargarDatosPaciente();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar métricas");
    }
  };

  const handleAgregarMetricaComun = async (metricaComun: MetricaComun) => {
    if (!rut) {
      toast.error("Debe ingresar un RUT válido antes de agregar métricas");
      return;
    }

    try {
      const payload = {
        rut_paciente: rut,
        id_parametro: metricaComun.id_parametro,
        min_normal: Number(metricaComun.rangoMin),
        max_normal: Number(metricaComun.rangoMax),
        min_critico: Number(metricaComun.rangoMin) - 10,
        max_critico: Number(metricaComun.rangoMax) + 10,
        vigencia_desde: new Date().toISOString(),
        vigencia_hasta: "2026-12-31T00:00:00Z",
        version: 1,
        definido_por: true,
      };

      await createRangoPaciente(payload);
      toast.success(`Métrica "${metricaComun.nombre}" agregada`);
      await cargarDatosPaciente(); // 🔁 recarga las métricas del paciente
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar métrica");
    }
  };

  const handleEliminarMetrica = async (id: string) => {
    try {
      await deleteRangoPaciente(Number(id)); // usa el servicio existente
      toast.success("Métrica eliminada correctamente");
      await cargarDatosPaciente(); // 🔁 vuelve a traer las métricas actualizadas
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la métrica");
    }
  };

  const handleAgregarTarea = async () => {
    if (!rut || !nuevaTarea.trim()) {
      toast.error("Debe ingresar un RUT válido y una descripción");
      return;
    }

    try {
      const nueva = await createTarea({
        rut_paciente: rut,
        rut_doctor: 12345678, // temporal
        descripcion: nuevaTarea.trim(),
      });

      setTareas((prev) => [...prev, nueva]);
      setNuevaTarea("");
      toast.success("Tarea creada correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al crear la tarea");
    }
  };

  const handleToggleTarea = async (id_tarea: number, completadoActual: string | null) => {
    try {
      const nuevoEstado = completadoActual ? null : new Date().toISOString();

      await updateTarea(id_tarea, { completado: nuevoEstado });

      // Actualiza el estado local sin recargar todo
      setTareas(prev =>
        prev.map(t =>
          t.id_tarea === id_tarea ? { ...t, completado: nuevoEstado } : t
        )
      );

      toast.success("Estado de la tarea actualizado");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleEliminarTarea = async (id_tarea: number) => {
    try {
      await deleteTarea(id_tarea);
      setTareas(tareas.filter((t) => t.id_tarea !== id_tarea));
      toast.success("Tarea eliminada");
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar la tarea");
    }
  };

  const actualizarMetrica = (
    id: string,
    campo: keyof Metrica,
    valor: string
  ) => {
    setMetricas(
      metricas.map((m) => (m.id === id ? { ...m, [campo]: valor } : m))
    );
  };

  // Obtener categorías únicas
  const categorias = ["Todas"];
  const [busqueda, setBusqueda] = useState("");

  // Filtrar métricas por categoría
  const metricasFiltradas = metricasDisponibles.filter(
    (m: ParametroClinicoOut) =>
      (m.descipcion ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda - Datos, Métricas y Tareas */}
      <div className="space-y-2">
        {/* Datos del Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Datos del Paciente
            </CardTitle>
            <CardDescription>
              Información general y calendario de atenciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* RUT + botón Cargar */}
              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="rut">RUT / ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="rut"
                    value={rutInput}
                    placeholder="12.345.678-9 o 123456789"
                    onChange={(e) => setRutInput(e.target.value)}
                  />
                  <Button onClick={cargarDatosPaciente}>Cargar</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input id="nombre" value={nombre} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edad">Edad</Label>
                <Input id="edad" value={edad} readOnly />
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="enfermedad">Enfermedad principal</Label>
                <Input
                  id="enfermedad"
                  value={enfermedadPrincipal}
                  onChange={(e) => setEnfermedadPrincipal(e.target.value)}
                  // luego haremos PATCH /paciente/{rut} para guardarla
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ultima" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Última atención
                </Label>
                <Input id="ultima" value={ultimaAtencion} readOnly />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="proximaCita"
                  className="flex items-center gap-1"
                >
                  <Calendar className="w-4 h-4" />
                  Próxima atención
                </Label>
                <Input
                  id="proximaCita"
                  type="datetime-local"
                  value={proximaCita}
                  onChange={(e) => setProximaCita(e.target.value)}
                  // más adelante lo persistimos en backend si quieres
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Objetivo */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Métricas Objetivo
                </CardTitle>
                <CardDescription>
                  Rangos esperados para el seguimiento del paciente
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalMetricasAbiertas(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>

                <Dialog
                  open={modalMetricasAbiertas}
                  onOpenChange={setModalMetricasAbiertas}
                >
                  <DialogContentGrande>
                    <DialogHeader className="flex flex-wrap gap-2 mb-4">
                      <DialogTitle>Agregar Métrica Común</DialogTitle>
                      <DialogDescription>
                        Seleccione una métrica predefinida con rangos estándar.
                        Puede editarla después para adaptarla al paciente.
                      </DialogDescription>
                    </DialogHeader>

                    {/* 🔍 Buscador */}
                    <input
                      type="text"
                      placeholder="Buscar métrica..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full border px-3 py-2 rounded mb-4 text-sm"
                    />

                    {/* Filtro por categorías */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {categorias.map((cat) => (
                        <Button
                          key={cat}
                          variant={
                            categoriaSeleccionada === cat
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setCategoriaSeleccionada(cat)}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>

                    {/* Grid de métricas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {metricasFiltradas.map((param) => (
                        <Card
                          key={param.id_parametro}
                          className="cursor-pointer transition-all hover:shadow-sm hover:border-blue-400"
                          onClick={() =>
                            handleAgregarMetricaComun({
                              id_parametro: param.id_parametro,
                              nombre: param.descipcion ?? param.codigo,
                              rangoMin: String(param.rango_ref_min ?? ""),
                              rangoMax: String(param.rango_ref_max ?? ""),
                              unidad: param.unidad_codigo ?? "",
                            })
                          }
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm text-gray-900">
                              {param.descipcion}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {param.codigo}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            <p>
                              Rango: {param.rango_ref_min} –{" "}
                              {param.rango_ref_max} {param.unidad_codigo}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </DialogContentGrande>
                </Dialog>

                <Button
                  onClick={() =>
                    editandoMetricas
                      ? handleGuardarMetricas()
                      : setEditandoMetricas(true)
                  }
                  variant={editandoMetricas ? "default" : "outline"}
                  size="sm"
                >
                  {editandoMetricas ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de métricas */}
            {metricas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay métricas configuradas</p>
                <p className="text-sm mt-2">
                  Haga clic en "Agregar" para seleccionar métricas comunes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {metricas.map((metrica) => (
                  <div
                    key={metrica.id}
                    className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-3 gap-4 mb-2">
                      <div className="flex-1">
                        {editandoMetricas ? (
                          <Input
                            value={metrica.nombre}
                            onChange={(e) =>
                              actualizarMetrica(
                                metrica.id,
                                "nombre",
                                e.target.value
                              )
                            }
                            className="mb-2"
                            placeholder="Nombre de la métrica"
                          />
                        ) : (
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-gray-900">{metrica.nombre}</h4>
                            {metrica.valorActual && (
                              <Badge
                                variant={
                                  metrica.cumple ? "secondary" : "destructive"
                                }
                                className="gap-5"
                              >
                                {metrica.cumple ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <AlertCircle className="w-3 h-3" />
                                )}
                                {metrica.cumple ? "En meta" : "Fuera de meta"}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-600">
                              Mínimo
                            </Label>
                            {editandoMetricas ? (
                              <Input
                                type="number"
                                value={metrica.rangoMin}
                                onChange={(e) =>
                                  actualizarMetrica(
                                    metrica.id,
                                    "rangoMin",
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">
                                {metrica.rangoMin} {metrica.unidad}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">
                              Máximo
                            </Label>
                            {editandoMetricas ? (
                              <Input
                                type="number"
                                value={metrica.rangoMax}
                                onChange={(e) =>
                                  actualizarMetrica(
                                    metrica.id,
                                    "rangoMax",
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">
                                {metrica.rangoMax} {metrica.unidad}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">
                              Unidad
                            </Label>
                            {editandoMetricas ? (
                              <Input
                                value={metrica.unidad}
                                onChange={(e) =>
                                  actualizarMetrica(
                                    metrica.id,
                                    "unidad",
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">
                                {metrica.unidad}
                              </p>
                            )}
                          </div>
                        </div>

                        {metrica.valorActual && !editandoMetricas && (
                          <div className="mt-1 pt-2 border-t">
                            <Label className="text-xs text-gray-600">
                              Valor actual del paciente
                            </Label>
                            <p className="text-lg text-gray-900">
                              {metrica.valorActual} {metrica.unidad}
                            </p>
                          </div>
                        )}
                      </div>

                      {editandoMetricas && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarMetrica(metrica.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tareas de Seguimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              Tareas de Seguimiento
            </CardTitle>
            <CardDescription>
              Actividades y controles asignados al paciente
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Lista de tareas */}
            <div className="space-y-2">
              {tareas.map((tarea) => (
                <div
                  key={tarea.id_tarea}
                  className={`p-3 border rounded-lg flex items-start justify-between ${
                    tarea.completado
                      ? "bg-green-50 border-green-200"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    id={`tarea-${tarea.id_tarea}`}
                    checked={!!tarea.completado}
                    onCheckedChange={() => handleToggleTarea(tarea.id_tarea, tarea.completado ?? null)}
                    className="mt-1"
                  />
                    <div className="flex-1">
                      <Label
                        htmlFor={`tarea-${tarea.id_tarea}`}
                        className={`cursor-pointer ${
                          tarea.completado
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {tarea.descripcion}
                      </Label>

                      <p className="text-xs text-gray-500 mt-1">
                        Creada:{" "}
                        {new Date(tarea.creado).toLocaleDateString("es-ES")}
                        {tarea.completado && (
                          <>
                            {" "}
                            • Completada:{" "}
                            {new Date(tarea.completado).toLocaleDateString(
                              "es-ES"
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEliminarTarea(tarea.id_tarea)}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Agregar nueva tarea */}
            <div className="flex gap-2">
              <Input
                placeholder="Escriba una nueva tarea para el paciente..."
                value={nuevaTarea}
                onChange={(e) => setNuevaTarea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAgregarTarea()}
              />
              <Button onClick={handleAgregarTarea}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna Derecha - Lista de Verificación y Estado Actual */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Estado Actual
            </CardTitle>
            <CardDescription>Resumen dinámico del seguimiento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estadísticas de Tareas */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-purple-900">
                  Cumplimiento de Tareas
                </h4>
                <Badge variant="secondary">{porcentajeTareas}%</Badge>
              </div>
              <Progress value={porcentajeTareas} className="mb-2" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Completadas</span>
                  </div>
                  <span className="text-gray-900">{tareasCompletadas}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-700">Pendientes</span>
                  </div>
                  <span className="text-gray-900">{tareasPendientes}</span>
                </div>
              </div>
            </div>

            {/* Estadísticas de Métricas */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-green-900">
                  Cumplimiento de Métricas
                </h4>
                <Badge variant="secondary">{porcentajeMetricas}%</Badge>
              </div>
              <Progress value={porcentajeMetricas} className="mb-2" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">En meta</span>
                  </div>
                  <span className="text-gray-900">{metricasCumplen}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-gray-700">Fuera de meta</span>
                  </div>
                  <span className="text-gray-900">{metricasNoCumplen}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Alertas activas */}
            <div>
              <h4 className="text-sm text-gray-900 mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Alertas Activas
              </h4>
              <div className="space-y-2">
                {metricasNoCumplen > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-900">
                        {metricasNoCumplen}{" "}
                        {metricasNoCumplen === 1
                          ? "métrica está"
                          : "métricas están"}{" "}
                        fuera del rango objetivo
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Revisar:{" "}
                        {metricas
                          .filter((m) => !m.cumple)
                          .map((m) => m.nombre)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {tareasPendientes > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-900">
                        {tareasPendientes}{" "}
                        {tareasPendientes === 1
                          ? "tarea pendiente"
                          : "tareas pendientes"}{" "}
                        de completar
                      </p>
                    </div>
                  </div>
                )}

                {metricasNoCumplen === 0 && tareasPendientes === 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-900">
                        ✓ Todas las métricas están en rango objetivo
                      </p>
                      <p className="text-sm text-green-900">
                        ✓ Todas las tareas han sido completadas
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Resumen de seguimiento */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm text-blue-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Resumen de Seguimiento
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Paciente:</span>
                  <span className="text-gray-900 text-right">{nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Adherencia general:</span>
                  <Badge
                    variant={
                      porcentajeTareas >= 80 ? "secondary" : "destructive"
                    }
                  >
                    {Math.round((porcentajeTareas + porcentajeMetricas) / 2)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Última atención:</span>
                  <span className="text-gray-900 text-right text-xs">
                    {ultimaAtencion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Próxima atención:</span>
                  <span className="text-gray-900 text-right text-xs">
                    {proximaCita
                      ? new Date(proximaCita).toLocaleString("es-CL", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Sin cita programada"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Estado:</span>
                  <Badge
                    variant={
                      metricasNoCumplen === 0 && tareasPendientes === 0
                        ? "secondary"
                        : "default"
                    }
                  >
                    {metricasNoCumplen === 0 && tareasPendientes === 0
                      ? "Controlado"
                      : "En seguimiento"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Recomendaciones */}
            {(metricasNoCumplen > 0 || tareasPendientes > 0) && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="text-sm text-orange-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recomendaciones
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {metricasNoCumplen > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>
                        Revisar y ajustar el plan terap��utico para las métricas
                        fuera de rango
                      </span>
                    </li>
                  )}
                  {tareasPendientes > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>
                        Reforzar educación sobre las tareas pendientes de
                        completar
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>
                      Programar seguimiento telefónico para verificar adherencia
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

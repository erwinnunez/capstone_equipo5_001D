// src/components/cuidador/AlertasModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  AlertTriangle, 
  Clock, 
  User, 
  Calendar, 
  FileText, 
  Loader2,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { listarMedicionesConAlerta, type MedicionOut, type EstadoAlerta } from "../../services/medicion";

interface AlertasModalProps {
  isOpen: boolean;
  onClose: () => void;
  rutPaciente: string;
}

const estadoAlertaLabels: Record<EstadoAlerta, string> = {
  nueva: "Nueva",
  en_proceso: "En Proceso",
  resuelta: "Resuelta",
  ignorada: "Ignorada"
};

const estadoAlertaVariants: Record<EstadoAlerta, "default" | "secondary" | "destructive" | "outline"> = {
  nueva: "destructive",
  en_proceso: "default",
  resuelta: "secondary",
  ignorada: "outline"
};

const severidadColors: Record<string, string> = {
  baja: "text-yellow-600 bg-yellow-50 border-yellow-200",
  media: "text-orange-600 bg-orange-50 border-orange-200",
  alta: "text-red-600 bg-red-50 border-red-200",
  critica: "text-red-800 bg-red-100 border-red-300"
};

export default function AlertasModal({ isOpen, onClose, rutPaciente }: AlertasModalProps) {
  const [alertas, setAlertas] = useState<MedicionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlertas = async () => {
    if (!rutPaciente) return;
    
    try {
      setLoading(true);
      setError(null);

      const result = await listarMedicionesConAlerta(1, 50, {
        rut_paciente: rutPaciente
      });

      if (result.ok) {
        setAlertas(result.data.items);
      } else {
        setError(result.message || "Error al cargar las alertas");
      }
    } catch (err: any) {
      console.error("Error al cargar alertas:", err);
      setError(err?.message || "Error al cargar las alertas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && rutPaciente) {
      loadAlertas();
    }
  }, [isOpen, rutPaciente]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getEstadoIcon = (estado: EstadoAlerta) => {
    switch (estado) {
      case "nueva":
        return <AlertTriangle className="h-4 w-4" />;
      case "en_proceso":
        return <Clock className="h-4 w-4" />;
      case "resuelta":
        return <CheckCircle className="h-4 w-4" />;
      case "ignorada":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] h-[85vh] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas del Paciente
          </DialogTitle>
          <DialogDescription>
            RUT: {rutPaciente} • {alertas.length} alerta{alertas.length !== 1 ? 's' : ''} encontrada{alertas.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 py-2 min-h-0" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Cargando alertas...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && alertas.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin alertas</h3>
              <p className="text-muted-foreground">
                Este paciente no tiene alertas actualmente.
              </p>
            </div>
          )}

          {!loading && !error && alertas.length > 0 && (
            <div className="space-y-2 pr-2">
              {alertas.map((alerta) => (
                <Card key={alerta.id_medicion} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Fila principal - toda la info importante en una línea */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(alerta.estado_alerta)}
                          <span className="font-semibold">Medición #{alerta.id_medicion}</span>
                        </div>
                        <Badge 
                          variant={estadoAlertaVariants[alerta.estado_alerta]}
                          className="text-xs"
                        >
                          {estadoAlertaLabels[alerta.estado_alerta]}
                        </Badge>
                        {alerta.severidad_max && (
                          <Badge 
                            className={`text-xs font-medium ${severidadColors[alerta.severidad_max.toLowerCase()] || severidadColors.media}`}
                          >
                            {alerta.severidad_max.toUpperCase()}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{alerta.registrado_por}</span>
                        </div>
                        {alerta.origen && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {alerta.origen}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(alerta.fecha_registro)}</span>
                      </div>
                    </div>

                    {/* Contenido de alertas y observaciones - compacto */}
                    {(alerta.resumen_alerta || alerta.observacion) && (
                      <div className="space-y-1 mb-2">
                        {alerta.resumen_alerta && (
                          <div className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-orange-700 leading-tight">{alerta.resumen_alerta}</span>
                            </div>
                          </div>
                        )}

                        {alerta.observacion && (
                          <div className="flex items-start gap-2 text-xs">
                            <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground leading-tight">{alerta.observacion}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Información de seguimiento - en una fila horizontal */}
                    <div className="flex items-center justify-between text-xs border-t pt-2">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-muted-foreground">Evaluada: </span>
                          <span className="font-medium">{alerta.evaluada_en ? formatDate(alerta.evaluada_en) : "Pendiente"}</span>
                        </div>
                        
                        {alerta.tomada_por && alerta.tomada_en ? (
                          <div>
                            <span className="text-muted-foreground">Tomada por: </span>
                            <span className="font-medium">ID {alerta.tomada_por} • {formatDate(alerta.tomada_en)}</span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-muted-foreground">Estado: </span>
                            <span className="font-medium">Sin asignar</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        {alerta.estado_alerta === "resuelta" && alerta.resuelta_en && (
                          <span className="text-green-600 font-medium">Resuelta: {formatDate(alerta.resuelta_en)}</span>
                        )}
                        
                        {alerta.estado_alerta === "ignorada" && alerta.ignorada_en && (
                          <span className="text-gray-600 font-medium">Ignorada: {formatDate(alerta.ignorada_en)}</span>
                        )}
                        
                        {alerta.estado_alerta === "nueva" && (
                          <span className="text-red-600 font-medium">⚠️ Requiere atención</span>
                        )}
                        
                        {alerta.estado_alerta === "en_proceso" && (
                          <span className="text-blue-600 font-medium">🔄 En proceso</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t bg-white p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total: {alertas.length} alerta{alertas.length !== 1 ? 's' : ''} • 
              {alertas.filter(a => a.estado_alerta === 'nueva').length} nueva{alertas.filter(a => a.estado_alerta === 'nueva').length !== 1 ? 's' : ''}
            </div>
            <Button variant="outline" onClick={onClose} className="px-6">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Activity, Bell, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { listNotificaciones, type NotificacionOut, marcarLeida } from "../../services/notificaciones";


type Variant = "default" | "secondary" | "destructive" | "outline";
const getNotificationColor = (t: string): Variant =>
  t === "critical" ? "destructive" : t === "warning" ? "secondary" : "outline";

// Etiqueta visible en español (sin tocar los valores internos)
const typeLabel = (t: string) => {
  switch (t) {
    case "critical":
      return "Crítica";
    case "warning":
      return "Advertencia";
    case "info":
      return "Información";
    default:
      return t;
  }
};

export default function CuidadorNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<NotificacionOut[]>([]);
  const [cargando, setCargando] = useState(true);
    const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 7; // cantidad por página

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth") || "{}");
    const rutCuidador = authData?.user?.id;

    if (!rutCuidador) {
      console.error("No se encontró rut_cuidador en localStorage");
      setCargando(false);
      return;
    }

    setCargando(true);
    listNotificaciones(rutCuidador, page, limit)
      .then((data) => {
        setNotificaciones(data.items || []);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        console.error("Error al cargar notificaciones:", err);
      })
      .finally(() => setCargando(false));
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  const handleMarcarLeida = async (id: number) => {
    try {
      await marcarLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id_notificacion === id ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Centro de notificaciones</CardTitle>
        <CardDescription>
          Mantente al día con alertas y eventos importantes de tus pacientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <p className="text-gray-500 text-sm text-center">Cargando notificaciones...</p>
        ) : notificaciones.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No hay notificaciones</p>
        ) : (
          <>
            <div className="space-y-3">
              {notificaciones.map((n) => (
                <div
                  key={n.id_notificacion}
                  className={`flex items-start space-x-3 p-4 border rounded-lg ${
                    n.leida ? "bg-gray-50" : "bg-blue-50"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {n.severidad === "critica" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    {n.severidad === "moderada" && <Bell className="h-5 w-5 text-yellow-500" />}
                    {n.severidad === "leve" && <Activity className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Badge variant={getNotificationColor(n.severidad)}>
                        {typeLabel(n.severidad)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(n.creada_en).toLocaleString("es-CL")}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mt-1">{n.titulo}</p>
                    <p className="text-sm">{n.mensaje}</p>
                    {!n.leida && (
                      <button
                        className="text-xs text-blue-600 hover:underline mt-2"
                        onClick={() => handleMarcarLeida(n.id_notificacion)}
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 🔹 Paginador numérico */}
            <div className="flex justify-center items-center mt-4 space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 border rounded text-sm ${
                    page === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
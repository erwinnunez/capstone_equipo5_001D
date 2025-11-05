import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { getPreferencias, updatePreferencias, type PreferenciaNotificacion } from "../../services/preferencias";

export default function CuidadorPreferencias() {
  const [preferencias, setPreferencias] = useState<PreferenciaNotificacion | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    const rutCuidador = auth?.user?.id;

    if (!rutCuidador) return;

    getPreferencias(rutCuidador)
      .then(setPreferencias)
      .catch(() => {
        setPreferencias({
          rut_cuidador: rutCuidador,
          recibir_criticas: true,
          recibir_moderadas: true,
          recibir_leves: false,
          canal_app: true,
          canal_email: true,
        });
      });
  }, []);

  type CamposEditables =
    | "recibir_criticas"
    | "recibir_moderadas"
    | "recibir_leves"
    | "canal_app"
    | "canal_email";

  const handleToggle = (key: CamposEditables) => {
    if (!preferencias) return;
    setPreferencias({ ...preferencias, [key]: !preferencias[key] });
  };

  const handleGuardar = async () => {
    if (!preferencias) return;
    setGuardando(true);
    try {
      await updatePreferencias(preferencias.rut_cuidador, preferencias);
      alert("Preferencias actualizadas correctamente");
    } catch {
      alert("Error al guardar preferencias");
    } finally {
      setGuardando(false);
    }
  };

  if (!preferencias) {
    return <p className="text-gray-500 text-sm text-center">Cargando preferencias...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias de notificación</CardTitle>
        <CardDescription>Configura qué alertas y canales deseas recibir</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          {
            key: "recibir_criticas" as const,
            label: "Alertas críticas",
            desc: "Notificaciones inmediatas por condiciones graves.",
          },
          {
            key: "recibir_moderadas" as const,
            label: "Alertas moderadas",
            desc: "Avisos por eventos importantes.",
          },
          {
            key: "recibir_leves" as const,
            label: "Alertas leves",
            desc: "Notificaciones informativas o leves.",
          },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{label}</h4>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
            <Switch
              checked={preferencias[key]}
              onCheckedChange={() => handleToggle(key)}
              aria-label={`Activar ${label}`}
            />
          </div>
        ))}

        <hr className="my-2" />

        {[
          { key: "canal_app" as const, label: "Notificaciones en la aplicación" },
          { key: "canal_email" as const, label: "Notificaciones por correo electrónico" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span>{label}</span>
            <Switch checked={preferencias[key]} onCheckedChange={() => handleToggle(key)} />
          </div>
        ))}

        <Button onClick={handleGuardar} className="w-full mt-4" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar preferencias"}
        </Button>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export interface RegisterCaregiverPageProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function RegisterCaregiverPage({ onCancel, onSuccess }: RegisterCaregiverPageProps) {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [estado, setEstado] = useState<boolean>(true);

  const handleSubmit = async () => {
    // TODO: llamar a tu servicio de crear cuidador
    onSuccess();
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Registro de Cuidador</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Contraseña</Label>
          <Input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Teléfono (9 dígitos)</Label>
          <Input
            inputMode="numeric"
            maxLength={9}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={estado} onCheckedChange={(v: boolean) => setEstado(v)} id="estadoCare" />
          <Label htmlFor="estadoCare">{estado ? "Activo" : "Inactivo"}</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSubmit}>Registrar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

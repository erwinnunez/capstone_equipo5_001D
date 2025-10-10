import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
// ... (tus imports de servicio, si los tienes)

export interface RegisterPatientPageProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function RegisterPatientPage({ onCancel, onSuccess }: RegisterPatientPageProps) {
  // estado mínimo de ejemplo — adapta a tus campos reales
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [estado, setEstado] = useState<boolean>(true);
  const [tipoSangre, setTipoSangre] = useState<string>("O+");

  const handleSubmit = async () => {
    // TODO: llamar a tu servicio de crear paciente
    onSuccess();
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Registro de Paciente</CardTitle>
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

        <div className="space-y-2">
          <Label>Tipo de sangre</Label>
          <Select value={tipoSangre} onValueChange={(v: string) => setTipoSangre(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={estado} onCheckedChange={(v: boolean) => setEstado(v)} id="estado" />
          <Label htmlFor="estado">{estado ? "Activo" : "Inactivo"}</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSubmit}>Registrar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

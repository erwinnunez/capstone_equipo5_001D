// src/components/caregiver/RegisterCaregiverPage.tsx
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { formatearRut, validarRutChile, limpiarRut } from "../../utils/rut";
import {
  createCuidador,
  type CuidadorCreatePayload,
  toNiceMessage as niceCuiMsg,
} from "../../services/cuidador";
import ErrorAlertModal from "../common/ErrorAlertModal";

export interface RegisterCaregiverPageProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function RegisterCaregiverPage({ onCancel, onSuccess }: RegisterCaregiverPageProps) {
  const [seguro, setSeguro] = useState<string>("");
  const [rut, setRut] = useState("");
  const [rutTouched, setRutTouched] = useState(false);
  const rutValido = useMemo(() => validarRutChile(rut), [rut]);

  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [sexo, setSexo] = useState<"true" | "false">("true");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const showError = (msg: string) => { setErrorMsg(msg); setErrorOpen(true); };

  // RUT input (formateado en pantalla)
  const onRutChange = (v: string) => {
    const soloPermitidos = v.replace(/[^0-9kK.\-]/g, "");
    setRut(formatearRut(soloPermitidos));
  };
  const onRutBlur = () => { setRutTouched(true); setRut((prev) => formatearRut(prev)); };
  const onRutPaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").trim();
    const limpio = text.replace(/[^0-9kK.\-]/g, "");
    setRut(formatearRut(limpio));
    setRutTouched(true);
  };
  const onRutKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (allowed.includes(e.key)) return;
    const isDigit = /^[0-9]$/.test(e.key);
    const isK = e.key.toLowerCase() === "k";
    const isSep = e.key === "." || e.key === "-";
    if (!isDigit && !isK && !isSep) e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!rut || !rutValido) return showError("RUT inválido. Revisa dígitos y dígito verificador.");
    if (!primerNombre || !primerApellido || !segundoApellido)
      return showError("Completa nombres y apellidos requeridos.");
    if (!email) return showError("Email es requerido.");
    if (!contrasena) return showError("Contraseña es requerida.");
    if (!telefono || telefono.replace(/\D/g, "").length !== 9)
      return showError("Teléfono debe tener 9 dígitos.");

    // 👉 Se envía sin puntos ni guion (solo dígitos + DV; DV puede ser K)
    const rutSinFormato = limpiarRut(rut); // e.g. "212511374" o "12345678K"

    const payload: CuidadorCreatePayload = {
      rut_cuidador: rutSinFormato,
      primer_nombre_cuidador: primerNombre.trim(),
      segundo_nombre_cuidador: segundoNombre.trim(),
      primer_apellido_cuidador: primerApellido.trim(),
      segundo_apellido_cuidador: segundoApellido.trim(),
      sexo: sexo === "true",
      direccion: direccion.trim(),
      telefono: Number(telefono.replace(/\D/g, "")),
      email: email.trim().toLowerCase(),
      contrasena,
  estado: true,
  seguro,
    };

    try {
      setSubmitting(true);
      const resp = await createCuidador(payload);
      if (!resp.ok) {
        const msg = resp.details ? niceCuiMsg(resp.details) : resp.message;
        return showError(msg || "No se pudo registrar al cuidador.");
      }
      onSuccess();
    } catch (e: any) {
      showError(e?.message || "Error inesperado registrando cuidador.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ErrorAlertModal open={errorOpen} message={errorMsg} onClose={() => setErrorOpen(false)} />

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* RUT */}
          <div className="space-y-2">
            <Label>RUT</Label>
            <Input
              value={rut}
              onChange={(e) => onRutChange(e.target.value)}
              onBlur={onRutBlur}
              onPaste={onRutPaste}
              onKeyDown={onRutKeyDown}
              placeholder="12.345.678-5"
              inputMode="text"
              autoCapitalize="characters"
              maxLength={12}
              aria-invalid={rutTouched && !rutValido}
              className={rutTouched && !rutValido ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {rutTouched && !rutValido ? (
              <p className="text-xs text-red-600">RUT inválido.</p>
            ) : rutValido ? (
              <p className="text-xs text-gray-500">
                Se enviará como <span className="font-mono">{limpiarRut(rut)}</span> (sin puntos ni guion).
              </p>
            ) : (
              <p className="text-xs text-gray-500">Ingresa el RUT; se formatea visualmente.</p>
            )}
          </div>

          {/* Sexo */}
          <div className="space-y-2">
            <Label>Sexo</Label>
            <Select value={sexo} onValueChange={(v: string) => setSexo(v as "true" | "false")}>
              <SelectTrigger><SelectValue placeholder="Sexo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Masculino</SelectItem>
                <SelectItem value="false">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nombres */}
          <div className="space-y-2">
            <Label>Primer nombre</Label>
            <Input value={primerNombre} onChange={(e) => setPrimerNombre(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Segundo nombre</Label>
            <Input value={segundoNombre} onChange={(e) => setSegundoNombre(e.target.value)} />
          </div>

          {/* Apellidos */}
          <div className="space-y-2">
            <Label>Primer apellido</Label>
            <Input value={primerApellido} onChange={(e) => setPrimerApellido(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Segundo apellido</Label>
            <Input value={segundoApellido} onChange={(e) => setSegundoApellido(e.target.value)} />
          </div>

          {/* Seguro */}
          <div className="space-y-2 md:col-span-2">
            <Label>Seguro</Label>
            <Select value={seguro} onValueChange={(v: string) => setSeguro(v)}>
              <SelectTrigger><SelectValue placeholder="Selecciona seguro" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Fonasa">Fonasa</SelectItem>
                <SelectItem value="Isapre">Isapre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Dirección */}
          <div className="space-y-2 md:col-span-2">
            <Label>Dirección</Label>
            <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </div>

          {/* Teléfono / Email */}
          <div className="space-y-2">
            <Label>Teléfono (9 dígitos)</Label>
            <Input
              inputMode="numeric"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
              maxLength={9}
              placeholder="999998888"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label>Contraseña</Label>
            <Input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onCancel} type="button">Cancelar</Button>
          <Button onClick={handleSubmit} type="button" disabled={submitting}>
            {submitting ? "Registrando..." : "Registrar cuidador"}
          </Button>
        </div>
      </div>
    </>
  );
}

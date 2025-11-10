// src/components/paciente/RegisterPatientPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { formatearRut, validarRutChile } from "../../utils/rut";

// Services (ajusta rutas si es necesario)
import {
  createPaciente,
  type PacienteCreatePayload,
  toNiceMessage as nicePacMsg,
} from "../../services/paciente";
import { listComunas, type ComunaOut } from "../../services/comuna";
import { listCesfam, type CesfamOut } from "../../services/cesfam";

import ErrorAlertModal from "../common/ErrorAlertModal";

export interface RegisterPatientPageProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

// === Normaliza RUT para API (string): quita puntos/guion y deja K mayúscula ===
function rutToApi(rut: string): string {
  return (rut || "").replace(/\./g, "").replace(/-/g, "").toUpperCase();
}

export default function RegisterPatientPage({ onCancel, onSuccess }: RegisterPatientPageProps) {
  // ---- RUT con util: formateo/validación/normalización
  const [rut, setRut] = useState<string>("");
  const [rutTouched, setRutTouched] = useState(false);
  const rutValido = useMemo(() => validarRutChile(rut), [rut]);
  const rutApi = useMemo(() => (rutValido ? rutToApi(rut) : null), [rut, rutValido]); // <-- string con K

  // ---- Estado del formulario (todos los campos necesarios; sin "estado")
  const [pac, setPac] = useState<Omit<PacienteCreatePayload, "rut_paciente" | "estado">>({
    id_comuna: 0,
    primer_nombre_paciente: "",
    segundo_nombre_paciente: "",
    primer_apellido_paciente: "",
    segundo_apellido_paciente: "",
    fecha_nacimiento: "1990-01-01",
    sexo: true,
    tipo_de_sangre: "O+",
    enfermedades: "",
    seguro: "",
    direccion: "",
    telefono: 0,
    email: "",
    contrasena: "",
    tipo_paciente: "Crónico",
    nombre_contacto: "",
    telefono_contacto: 0,
    id_cesfam: 0,
    fecha_inicio_cesfam: "2024-01-01",
    fecha_fin_cesfam: null,
    activo_cesfam: true,
  });

  const [loading, setLoading] = useState<boolean>(false);

  // ---- Modal de error (un error a la vez, como en Admin)
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const showError = (msg: string | any) => {
    // Asegurar que siempre sea string
    const errorMessage = typeof msg === 'string' ? msg : 
                        (msg?.message ? String(msg.message) : 
                         JSON.stringify(msg));
    setErrorMsg(errorMessage);
    setErrorOpen(true);
  };

  // ---- Comunas (con buscador)
  const [comunas, setComunas] = useState<ComunaOut[]>([]);
  const [loadingComunas, setLoadingComunas] = useState<boolean>(false);
  const [comunasError, setComunasError] = useState<string>("");
  const [comunaSearch, setComunaSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoadingComunas(true);
      setComunasError("");
      const resp = await listComunas({ page: 1, page_size: 5000 });
      if (!resp.ok) {
        setComunasError(resp.message || "No se pudieron obtener las comunas.");
        setComunas([]);
      } else {
        setComunas(resp.data.items ?? []);
      }
      setLoadingComunas(false);
    })();
  }, []);

  const comunasFiltradas = useMemo(() => {
    if (!comunaSearch.trim()) return comunas;
    const q = comunaSearch.toLowerCase();
    return comunas.filter((c) => c.nombre_comuna.toLowerCase().includes(q));
  }, [comunas, comunaSearch]);

  // Si cambia la comuna, limpiar CESFAM
  useEffect(() => {
    setPac((p) => ({ ...p, id_cesfam: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pac.id_comuna]);

  // ---- CESFAM (dependiente de comuna) + buscador
  const [cesfams, setCesfams] = useState<CesfamOut[]>([]);
  const [loadingCesfam, setLoadingCesfam] = useState<boolean>(false);
  const [cesfamError, setCesfamError] = useState<string>("");
  const [cesfamSearch, setCesfamSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setCesfamError("");
      setCesfams([]);
      if (!pac.id_comuna) return;
      setLoadingCesfam(true);
      const resp = await listCesfam({ page: 1, page_size: 5000, id_comuna: pac.id_comuna, estado: true });
      if (!resp.ok) {
        setCesfamError(resp.message || "No se pudieron obtener los CESFAM.");
      } else {
        setCesfams(resp.data.items ?? []);
      }
      setLoadingCesfam(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pac.id_comuna]);

  const cesfamsFiltrados = useMemo(() => {
    if (!cesfamSearch.trim()) return cesfams;
    const q = cesfamSearch.toLowerCase();
    return cesfams.filter(
      (x) =>
        x.nombre_cesfam.toLowerCase().includes(q) ||
        (x.direccion ?? "").toLowerCase().includes(q)
    );
  }, [cesfams, cesfamSearch]);

  // ---- Handlers RUT (util rut integrada)
  const onRutChange = (v: string) => {
    const soloPermitidos = v.replace(/[^0-9kK.\-]/g, "");
    setRut(formatearRut(soloPermitidos));
  };

  const onRutBlur = () => {
    setRutTouched(true);
    // Normaliza completamente al salir (por si quedó un formato raro)
    setRut((prev) => formatearRut(prev));
  };

  const onRutPaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").trim();
    const limpio = text.replace(/[^0-9kK.\-]/g, "");
    setRut(formatearRut(limpio));
    setRutTouched(true);
  };

  const onRutKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const allowedKeys = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End",
    ];
    if (allowedKeys.includes(e.key)) return;
    const isDigit = /^[0-9]$/.test(e.key);
    const isK = e.key.toLowerCase() === "k";
    const isSep = e.key === "." || e.key === "-";
    if (!isDigit && !isK && !isSep) {
      e.preventDefault();
    }
  };

  // ---- Submit
  const handleSubmit = async () => {
    // Validaciones clave (un error a la vez, con modal)
    if (!rut || !rutValido || rutApi === null) {
      setRutTouched(true);
      return showError("RUT inválido. Revisa dígitos y dígito verificador.");
    }
    if (!pac.email) {
      return showError("Email es requerido.");
    }
    if (!pac.contrasena) {
      return showError("Contraseña es requerida.");
    }
    if (!pac.primer_nombre_paciente || !pac.primer_apellido_paciente || !pac.segundo_apellido_paciente) {
      return showError("Completa nombres y apellidos requeridos.");
    }
    if (!pac.fecha_nacimiento) {
      return showError("La fecha de nacimiento es obligatoria.");
    }
    if (!pac.telefono || String(pac.telefono).replace(/\D/g, "").length !== 9) {
      return showError("Teléfono debe tener 9 dígitos.");
    }
    if (!pac.id_comuna) {
      return showError("Selecciona una comuna.");
    }
    if (!pac.id_cesfam) {
      return showError("Selecciona un CESFAM.");
    }

    // Payload final enviando RUT como STRING (preserva K), y limpiando teléfonos
    const payload: PacienteCreatePayload = {
      ...pac,
      rut_paciente: rutApi, // <-- string para API, con K si corresponde
      telefono: Number(String(pac.telefono).replace(/\D/g, "") || 0),
      telefono_contacto: Number(String(pac.telefono_contacto).replace(/\D/g, "") || 0),
      fecha_fin_cesfam: pac.fecha_fin_cesfam ? pac.fecha_fin_cesfam : null,
      estado: true, // siempre activo
    };

    try {
      setLoading(true);
      const resp = await createPaciente(payload);
      if (!resp.ok) {
        // Priorizar el mensaje personalizado del servicio
        let msg = resp.message || "No se pudo registrar al paciente.";
        if (resp.details) {
          try {
            const detailMsg = nicePacMsg(resp.details);
            if (typeof detailMsg === 'string' && detailMsg.trim()) {
              msg = detailMsg;
            }
          } catch (e) {
            console.error('Error procesando detalles:', e);
            // Usar mensaje base si falla el procesamiento
          }
        }
        return showError(msg);
      }
      onSuccess();
    } catch (e: any) {
      const errorMsg = e?.message || "Error inesperado registrando paciente.";
      console.error('Error creando paciente:', e);
      showError(typeof errorMsg === 'string' ? errorMsg : "Error inesperado registrando paciente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorAlertModal
        open={errorOpen}
        message={errorMsg}
        onClose={() => setErrorOpen(false)}
      />

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
            ) : rutValido && rutApi !== null ? (
              <p className="text-xs text-gray-500">
                Se enviará como <span className="font-mono">{rutApi}</span>.
              </p>
            ) : (
              <p className="text-xs text-gray-500">Ingresa el RUT; se formatea automáticamente.</p>
            )}
          </div>

          {/* COMUNA (buscador + selector) */}
          <div className="space-y-2">
            <Label>Comuna</Label>
            <Input
              placeholder="Buscar comuna…"
              value={comunaSearch}
              onChange={(e) => setComunaSearch(e.target.value)}
            />
            <Select
              value={pac.id_comuna ? String(pac.id_comuna) : ""}
              onValueChange={(v: string) => setPac({ ...pac, id_comuna: Number(v) })}
              disabled={loadingComunas || comunasFiltradas.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingComunas ? "Cargando comunas…" : "Selecciona una comuna"} />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {comunasFiltradas.map((c) => (
                  <SelectItem key={c.id_comuna} value={String(c.id_comuna)}>
                    {c.nombre_comuna} (Región {c.id_region})
                  </SelectItem>
                ))}
                {(!loadingComunas && comunasFiltradas.length === 0) && (
                  <div className="px-2 py-1 text-sm text-gray-500">Sin resultados</div>
                )}
              </SelectContent>
            </Select>
            {comunasError && <p className="text-xs text-red-600">{comunasError}</p>}
          </div>

          {/* Nombres */}
          <div className="space-y-2">
            <Label>Primer nombre</Label>
            <Input
              value={pac.primer_nombre_paciente}
              onChange={(e) => setPac({ ...pac, primer_nombre_paciente: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Segundo nombre</Label>
            <Input
              value={pac.segundo_nombre_paciente}
              onChange={(e) => setPac({ ...pac, segundo_nombre_paciente: e.target.value })}
            />
          </div>

          {/* Apellidos */}
          <div className="space-y-2">
            <Label>Primer apellido</Label>
            <Input
              value={pac.primer_apellido_paciente}
              onChange={(e) => setPac({ ...pac, primer_apellido_paciente: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Segundo apellido</Label>
            <Input
              value={pac.segundo_apellido_paciente}
              onChange={(e) => setPac({ ...pac, segundo_apellido_paciente: e.target.value })}
            />
          </div>

          {/* Fecha / Sexo */}
          <div className="space-y-2">
            <Label>Fecha de nacimiento *</Label>
            <Input
              type="date"
              value={pac.fecha_nacimiento}
              onChange={(e) => setPac({ ...pac, fecha_nacimiento: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Sexo</Label>
            <Select
              value={pac.sexo ? "true" : "false"}
              onValueChange={(v: string) => setPac({ ...pac, sexo: v === "true" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Masculino</SelectItem>
                <SelectItem value="false">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sangre / Enfermedades */}
          <div className="space-y-2">
            <Label>Tipo de sangre</Label>
            <Select
              value={pac.tipo_de_sangre}
              onValueChange={(v: string) => setPac({ ...pac, tipo_de_sangre: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo de sangre" />
              </SelectTrigger>
              <SelectContent>
                {bloodTypes.map((bt) => (
                  <SelectItem key={bt} value={bt}>
                    {bt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Enfermedades (opcional)</Label>
            <Input
              value={pac.enfermedades ?? ""}
              onChange={(e) => setPac({ ...pac, enfermedades: e.target.value })}
            />
          </div>

          {/* Seguro / Dirección */}
          <div className="space-y-2">
            <Label>Seguro (opcional)</Label>
            <Input
              value={pac.seguro ?? ""}
              onChange={(e) => setPac({ ...pac, seguro: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={pac.direccion} onChange={(e) => setPac({ ...pac, direccion: e.target.value })} />
          </div>

          {/* Teléfono / Email */}
          <div className="space-y-2">
            <Label>Teléfono (9 dígitos)</Label>
            <Input
              inputMode="numeric"
              value={pac.telefono ? String(pac.telefono) : ""}
              onChange={(e) =>
                setPac({ ...pac, telefono: Number(e.target.value.replace(/\D/g, "")) })
              }
              maxLength={9}
              placeholder="987654321"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={pac.email}
              onChange={(e) => setPac({ ...pac, email: e.target.value })}
            />
          </div>

          {/* Contraseña / Tipo paciente */}
          <div className="space-y-2">
            <Label>Contraseña</Label>
            <Input
              type="password"
              value={pac.contrasena}
              onChange={(e) => setPac({ ...pac, contrasena: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de paciente</Label>
            <Input
              value={pac.tipo_paciente}
              onChange={(e) => setPac({ ...pac, tipo_paciente: e.target.value })}
            />
          </div>

          {/* Contacto */}
          <div className="space-y-2">
            <Label>Nombre contacto</Label>
            <Input
              value={pac.nombre_contacto}
              onChange={(e) => setPac({ ...pac, nombre_contacto: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Teléfono contacto (9 dígitos)</Label>
            <Input
              inputMode="numeric"
              value={pac.telefono_contacto ? String(pac.telefono_contacto) : ""}
              onChange={(e) =>
                setPac({
                  ...pac,
                  telefono_contacto: Number(e.target.value.replace(/\D/g, "")),
                })
              }
              maxLength={9}
              placeholder="988887777"
            />
          </div>

          {/* CESFAM (buscador + selector; depende de comuna) */}
          <div className="space-y-2">
            <Label>CESFAM</Label>
            <Input
              placeholder="Buscar CESFAM…"
              value={cesfamSearch}
              onChange={(e) => setCesfamSearch(e.target.value)}
              disabled={!pac.id_comuna}
            />
            <Select
              value={pac.id_cesfam ? String(pac.id_cesfam) : ""}
              onValueChange={(v: string) => setPac({ ...pac, id_cesfam: Number(v) })}
              disabled={!pac.id_comuna || loadingCesfam || cesfamsFiltrados.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !pac.id_comuna
                      ? "Primero selecciona una comuna"
                      : loadingCesfam
                      ? "Cargando CESFAM…"
                      : "Selecciona un CESFAM"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {cesfamsFiltrados.map((c) => (
                  <SelectItem key={c.id_cesfam} value={String(c.id_cesfam)}>
                    {c.nombre_cesfam}
                    {c.direccion ? ` — ${c.direccion}` : ""}
                  </SelectItem>
                ))}
                {(!loadingCesfam && pac.id_comuna && cesfamsFiltrados.length === 0) && (
                  <div className="px-2 py-1 text-sm text-gray-500">Sin resultados</div>
                )}
              </SelectContent>
            </Select>
            {cesfamError && <p className="text-xs text-red-600">{cesfamError}</p>}
          </div>

          {/* Fechas CESFAM */}
          <div className="space-y-2">
            <Label>Fecha inicio CESFAM</Label>
            <Input
              type="date"
              value={pac.fecha_inicio_cesfam}
              onChange={(e) => setPac({ ...pac, fecha_inicio_cesfam: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Fecha fin CESFAM (opcional)</Label>
            <Input
              type="date"
              value={pac.fecha_fin_cesfam ?? ""}
              onChange={(e) =>
                setPac({ ...pac, fecha_fin_cesfam: e.target.value || null })
              }
            />
          </div>

          {/* Activo CESFAM */}
          <div className="space-y-2">
            <Label>Activo CESFAM</Label>
            <Select
              value={pac.activo_cesfam ? "true" : "false"}
              onValueChange={(v: string) => setPac({ ...pac, activo_cesfam: v === "true" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Activo CESFAM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creando..." : "Crear paciente"}
          </Button>
        </div>
      </div>
    </>
  );
}

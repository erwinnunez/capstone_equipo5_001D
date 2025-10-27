# app/schemas/medicion.py
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone

# ===== Utilidades simples para validar RUT plano (sin puntos ni guion, DV al final) =====
def _es_rut_plano(val: str) -> bool:
    if not isinstance(val, str):
        return False
    v = val.upper()
    if len(v) < 8 or len(v) > 9:
        return False
    cuerpo, dv = v[:-1], v[-1]
    if not cuerpo.isdigit():
        return False
    # DV puede ser 0-9 o K
    return dv.isdigit() or dv == "K"


# =========================
# Payloads CRUD de Medición
# =========================
class MedicionCreate(BaseModel):
    # RUT como string
    rut_paciente: str = Field(..., example="21251137K")
    fecha_registro: datetime
    origen: str = Field(..., min_length=3, max_length=100)
    registrado_por: str = Field(..., min_length=3, max_length=100)
    observacion: str = Field(..., max_length=255)
    evaluada_en: datetime
    tiene_alerta: bool
    severidad_max: str = Field(..., min_length=1, max_length=60)
    resumen_alerta: str = Field(..., min_length=3, max_length=255)

    @field_validator("rut_paciente")
    @classmethod
    def validar_rut_paciente(cls, v: str):
        if not _es_rut_plano(v):
            raise ValueError("rut_paciente debe ser string plano (8-9 dígitos + DV 0-9/K, sin puntos ni guion).")
        return v.upper()

    @field_validator("origen", "registrado_por", "observacion", "resumen_alerta")
    @classmethod
    def limpiar_texto(cls, v: str | None):
        return v.strip().capitalize() if v else v

    @field_validator("fecha_registro", "evaluada_en")
    @classmethod
    def validar_fechas(cls, v: datetime):
        # Fuerza tz-aware y valida no-futuro
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if v > now:
            raise ValueError("La fecha no puede ser futura.")
        return v


class MedicionUpdate(BaseModel):
    fecha_registro: datetime | None = None
    origen: str | None = Field(None, min_length=3, max_length=100)
    registrado_por: str | None = Field(None, min_length=3, max_length=100)
    observacion: str | None = Field(None, min_length=3, max_length=255)
    evaluada_en: datetime | None = None
    tiene_alerta: bool | None = None
    severidad_max: str | None = Field(None, min_length=1, max_length=60)
    resumen_alerta: str | None = Field(None, min_length=3, max_length=255)

    # Gestión de alerta (timestamps manuales opcionales)
    resuelta_en: datetime | None = None
    ignorada_en: datetime | None = None

    @field_validator("origen", "registrado_por", "observacion", "resumen_alerta")
    @classmethod
    def limpiar_texto_update(cls, v: str | None):
        return v.strip().capitalize() if v else v

    @field_validator("fecha_registro", "evaluada_en", "resuelta_en", "ignorada_en")
    @classmethod
    def validar_fechas_update(cls, v: datetime | None):
        if v is None:
            return v
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if v > now:
            raise ValueError("La fecha no puede ser futura")
        return v


# =========================
# Respuesta (Out)
# =========================
class MedicionOut(BaseModel):
    id_medicion: int
    rut_paciente: str                     # <-- string
    fecha_registro: datetime
    origen: str
    registrado_por: str
    observacion: str
    evaluada_en: datetime
    tiene_alerta: bool
    severidad_max: str
    resumen_alerta: str

    # Gestión de alerta
    estado_alerta: str                    # 'nueva' | 'en_proceso' | 'resuelta' | 'ignorada'
    tomada_por: str | None = None         # <-- string (rut médico) o None
    tomada_en: datetime | None = None

    resuelta_en: datetime | None = None
    ignorada_en: datetime | None = None

    class Config:
        from_attributes = True   # pydantic v2


# =========================
# Payloads de acciones
# =========================
class TomarAlertaPayload(BaseModel):
    # <-- Asegurado para que exista y sea importable
    rut_medico: str = Field(..., description="RUT del médico que toma la alerta (plano, sin puntos ni guion)")

    @field_validator("rut_medico")
    @classmethod
    def validar_rut_medico(cls, v: str):
        if not _es_rut_plano(v):
            raise ValueError("rut_medico debe ser string plano (8-9 dígitos + DV 0-9/K, sin puntos ni guion).")
        return v.upper()


class CambiarEstadoPayload(BaseModel):
    nuevo_estado: str = Field(..., pattern="^(resuelta|ignorada)$")

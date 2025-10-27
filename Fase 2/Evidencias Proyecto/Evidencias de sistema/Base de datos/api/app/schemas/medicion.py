# app/schemas/medicion.py
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone

class MedicionCreate(BaseModel):
    rut_paciente: int = Field(..., example="212511374")
    fecha_registro: datetime
    origen: str = Field(..., min_length=3, max_length=100)
    registrado_por: str = Field(..., min_length=3, max_length=100)
    observacion: str = Field(max_length=255)
    evaluada_en: datetime
    tiene_alerta: bool
    severidad_max: str = Field(..., min_length=1, max_length=60)
    resumen_alerta: str = Field(..., min_length=3, max_length=255)

    @field_validator("rut_paciente")
    @classmethod
    def validar_rut(cls, v: int):
        numero = str(v)
        if not numero.isdigit() or len(numero) > 9:
            raise ValueError("El RUT debe tener hasta 9 dígitos (incluyendo dígito verificador).")
        return v

    @field_validator("origen", "registrado_por", "observacion", "resumen_alerta")
    @classmethod
    def limpiar_texto(cls, v: str | None):
        return v.strip().capitalize() if v else v

    @field_validator("fecha_registro")
    @classmethod
    def validar_fecha_cambio(cls, v: datetime):
        now = datetime.now(timezone.utc)
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v > now:
            raise ValueError("La fecha de cambio no puede ser futura.")
        return v

class MedicionUpdate(BaseModel):
    fecha_registro: datetime | None = None
    origen: str | None = Field(None, min_length=3, max_length=100)
    registrado_por: str | None = Field(None, min_length=3, max_length=100)
    observacion: str | None  = Field(None, min_length=3, max_length=255)
    evaluada_en: datetime | None = None
    tiene_alerta: bool | None = None
    severidad_max: str | None = Field(None, min_length=1, max_length=60)  # <- opcional
    resumen_alerta: str | None  = Field(None, min_length=3, max_length=255)

    @field_validator("origen", "registrado_por", "observacion", "resumen_alerta")
    @classmethod
    def limpiar_texto_update(cls, v: str | None):
        return v.strip().capitalize() if v else v

    @field_validator("fecha_registro")
    @classmethod
    def validar_fecha_cambio(cls, v: datetime | None):
        if v is None:
            return v
        now = datetime.now(timezone.utc)
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v > now:
            raise ValueError("La fecha de cambio no puede ser futura")
        return v

class MedicionOut(BaseModel):
    id_medicion: int
    rut_paciente: int
    fecha_registro: datetime
    origen: str
    registrado_por: str
    observacion: str
    evaluada_en: datetime
    tiene_alerta: bool
    severidad_max: str
    resumen_alerta: str

    # === Nuevos campos de gestión ===
    estado_alerta: str
    tomada_por: int | None = None
    tomada_en: datetime | None = None

    class Config:
        from_attributes = True

# Payloads de acciones
class TomarAlertaPayload(BaseModel):
    rut_medico: int = Field(..., description="RUT del médico que toma la alerta")

class CambiarEstadoPayload(BaseModel):
    nuevo_estado: str = Field(..., pattern="^(resuelta|ignorada)$")

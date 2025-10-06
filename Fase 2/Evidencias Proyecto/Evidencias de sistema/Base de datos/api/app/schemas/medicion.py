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

    # --- VALIDAR RUT ---
    @field_validator("rut_paciente")
    @classmethod
    def validar_rut(cls, v):
        numero = str(v)
        if not numero.isdigit() or len(numero) > 9:
            raise ValueError("El RUT debe tener hasta 9 dígitos (incluyendo dígito verificador).")
        return v

    # --- LIMPIAR TEXTO ---
    @field_validator("origen", "registrado_por", "observacion", "resumen_alerta")
    @classmethod
    def limpiar_texto(cls, v):
        return v.strip().capitalize() if v else v
    
# Validar que la fecha de cambio no sea futura
    @field_validator("fecha_registro")
    @classmethod
    def validar_fecha_cambio(cls, v: datetime):
        now = datetime.now(timezone.utc)
        # Si la fecha viene sin tzinfo, la asumimos como UTC para evitar el error
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
    severidad_max: str | None = Field(..., min_length=1, max_length=60)
    resumen_alerta: str | None  = Field(None, min_length=3, max_length=255)

# --- LIMPIAR TEXTO ---
    @field_validator("origen", "registrado_por", "observacion", "resumen_alerta")
    @classmethod
    def limpiar_texto_update(cls, v):
        return v.strip().capitalize() if v else v

# Validar que la fecha de cambio no sea futura
    @field_validator("fecha_registro")
    @classmethod
    def validar_fecha_cambio(cls, v):
        if v > datetime.now():
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
    class Config:
        from_attributes = True

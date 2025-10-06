from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class GamificacionPerfilCreate(BaseModel):
    rut_paciente: int = Field(..., example="212511374")
    puntos: int = Field(..., ge=0, description="Cantidad total de puntos acumulados (no negativos)")
    racha_dias: int = Field(..., ge=0, description="Número de días consecutivos con actividad")
    ultima_actividad: datetime = Field(..., description="Fecha y hora de la última actividad registrada")


    # Validar formato de RUT chileno
    @field_validator("rut_paciente")
    @classmethod
    def validar_rut(cls, v, field):
        numero = str(v)
        if not numero.isdigit():
            raise ValueError(f"El {field.name} solo debe contener números (sin puntos ni guion).")
        if len(numero) != 9:
            raise ValueError(f"El {field.name} debe tener exactamente 9 dígitos.")
        return v

    # Validar que la fecha no sea futura
    @field_validator("ultima_actividad")
    @classmethod
    def validar_fecha(cls, v):
        if v > datetime.now():
            raise ValueError("La fecha de la última actividad no puede estar en el futuro")
        return v


class GamificacionPerfilUpdate(BaseModel):
    puntos: int | None = Field(None, ge=0, description="Cantidad total de puntos acumulados")
    racha_dias: int | None = Field(None, ge=0, description="Número de días consecutivos con actividad")
    ultima_actividad: datetime | None  = Field(None, description="Fecha de la última actividad registrada")

    @field_validator("ultima_actividad")
    @classmethod
    def validar_fecha(cls, v):
        if v and v > datetime.now():
            raise ValueError("La fecha de la última actividad no puede estar en el futuro")
        return v

class GamificacionPerfilOut(BaseModel):
    rut_paciente: int
    puntos: int
    racha_dias: int
    ultima_actividad: datetime
    class Config:
        from_attributes = True

from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class EventoGamificacionCreate(BaseModel):
    rut_paciente: int = Field(..., example="212511374", description="RUT del paciente con dígito verificador y sin guión")
    tipo: str = Field(..., min_length=3, max_length=100, example="Inicio de sesión")
    puntos: int = Field(..., ge=0, description="Cantidad de puntos ganados o perdidos")
    fecha: datetime = Field(..., description="Fecha y hora del evento")

# Validar RUT chileno
    @field_validator("rut_paciente")
    @classmethod
    def validar_rut(cls, v, field):
        numero = str(v)
        if not numero.isdigit():
            raise ValueError(f"El {field.name} solo debe contener números (sin puntos ni guion).")
        if len(numero) != 9:
            raise ValueError(f"El {field.name} debe tener exactamente 9 dígitos.")
        return v

    # Validar tipo de evento (solo letras, espacios y guiones)
    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v):
        import re
        if not re.match(r"^[\w\sáéíóúÁÉÍÓÚñÑ-]+$", v):
            raise ValueError("El tipo de evento solo puede contener letras, números, espacios y guiones")
        return v.strip().title()

class EventoGamificacionOut(BaseModel):
    id_evento: int
    rut_paciente: int
    tipo: str
    puntos: int
    fecha: datetime
    class Config:
        from_attributes = True

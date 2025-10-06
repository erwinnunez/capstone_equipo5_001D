from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone 

class CuidadorHistorialCreate(BaseModel):
    rut_cuidador: int = Field(..., description="RUT del cuidador asociado")
    fecha_cambio: datetime = Field(description="Fecha y hora del cambio realizado")
    cambio: str = Field(..., min_length=5, max_length=200, description="Descripción del cambio realizado")
    resultado: bool = Field(description="Indica si el cambio fue exitoso (True/False)")


    # --- VALIDAR RUT ---
    @field_validator("rut_cuidador")
    @classmethod
    def validar_rut(cls, v, field):
        numero = str(v)
        if not numero.isdigit():
            raise ValueError(f"El {field.name} solo debe contener números (sin puntos ni guion).")
        if len(numero) != 9:
            raise ValueError(f"El {field.name} debe tener exactamente 9 dígitos.")
        return v

# Validar que la fecha de cambio no sea futura
    def validar_fecha_cambio(cls, v: datetime):
        now = datetime.now(timezone.utc)
        # Si la fecha viene sin tzinfo, la asumimos como UTC para evitar el error
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v > now:
            raise ValueError("La fecha de cambio no puede ser futura.")
        return v

    # Validar que el texto 'cambio' no esté vacío o solo tenga espacios
    @field_validator("cambio")
    @classmethod
    def validar_cambio(cls, v):
        if not v.strip():
            raise ValueError("El campo 'cambio' no puede estar vacío")
        return v.strip()

class CuidadorHistorialOut(BaseModel):
    historial_id: int
    rut_cuidador: int
    fecha_cambio: datetime
    cambio: str
    resultado: bool
    class Config:
        from_attributes = True

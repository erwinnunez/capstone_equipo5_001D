from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class MedicoHistorialCreate(BaseModel):
    rut_medico: int = Field(..., example="212511374")
    fecha_cambio: datetime
    cambio: str = Field(..., min_length=3, max_length=255)
    resultado: bool

# --- VALIDAR RUT ---
    @field_validator("rut_medico")
    @classmethod
    def validar_rut(cls, v, field):
        numero = str(v)
        if not numero.isdigit():
            raise ValueError(f"El {field.name} solo debe contener números (sin puntos ni guion).")
        if len(numero) != 9:
            raise ValueError(f"El {field.name} debe tener exactamente 9 dígitos.")
        return v

    # --- LIMPIAR TEXTO ---
    @field_validator("cambio")
    @classmethod
    def limpiar_cambio(cls, v):
        return v.strip().capitalize() if v else v

class MedicoHistorialOut(BaseModel):
    historial_id: int
    rut_medico: int
    fecha_cambio: datetime
    cambio: str
    resultado: bool
    class Config:
        from_attributes = True

from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class UsuarioInsigniaCreate(BaseModel):
    rut_paciente: int = Field(..., example="212511374")
    id_insignia: int = Field(..., ge=1)
    otorgada_en: datetime

# --- VALIDAR RUT ---
    @field_validator("rut_paciente")
    @classmethod
    def validar_rut(cls, v, field):
        numero = str(v)
        if not numero.isdigit():
            raise ValueError(f"El {field.name} solo debe contener números (sin puntos ni guion).")
        if len(numero) != 9:
            raise ValueError(f"El {field.name} debe tener exactamente 9 dígitos.")
        return v

class UsuarioInsigniaOut(BaseModel):
    rut_paciente: int
    id_insignia: int
    otorgada_en: datetime
    class Config:
        from_attributes = True

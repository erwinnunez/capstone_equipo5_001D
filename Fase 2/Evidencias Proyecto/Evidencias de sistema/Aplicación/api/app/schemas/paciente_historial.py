from pydantic import BaseModel
from datetime import datetime

class PacienteHistorialCreate(BaseModel):
    rut_paciente: int
    fecha_cambio: datetime
    cambio: str
    resultado: bool

class PacienteHistorialOut(BaseModel):
    historial_id: int
    rut_paciente: int
    fecha_cambio: datetime
    cambio: str
    resultado: bool
    class Config:
        from_attributes = True

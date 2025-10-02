from pydantic import BaseModel
from datetime import datetime

class PacienteHistorialCreate(BaseModel):
    rut_paciente: int
    cambio: str | None = None
    resultado: bool | None = None

class PacienteHistorialOut(BaseModel):
    historial_id: int
    rut_paciente: int
    fecha_cambio: datetime
    cambio: str | None = None
    resultado: bool | None = None
    class Config:
        from_attributes = True

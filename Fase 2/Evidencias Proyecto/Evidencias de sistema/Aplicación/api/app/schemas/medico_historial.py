from pydantic import BaseModel
from datetime import datetime

class MedicoHistorialCreate(BaseModel):
    rut_medico: int
    fecha_cambio: datetime
    cambio: str
    resultado: bool

class MedicoHistorialOut(BaseModel):
    historial_id: int
    rut_medico: int
    fecha_cambio: datetime
    cambio: str
    resultado: bool
    class Config:
        from_attributes = True

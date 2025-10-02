from pydantic import BaseModel
from datetime import datetime

class CuidadorHistorialCreate(BaseModel):
    rut_cuidador: int
    fecha_cambio: datetime
    cambio: str
    resultado: bool

class CuidadorHistorialOut(BaseModel):
    historial_id: int
    rut_cuidador: int
    fecha_cambio: datetime
    cambio: str
    resultado: bool
    class Config:
        from_attributes = True

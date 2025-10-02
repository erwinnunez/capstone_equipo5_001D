from pydantic import BaseModel
from datetime import datetime

class CuidadorHistorialCreate(BaseModel):
    rut_cuidador: int
    cambio: str | None = None
    resultado: bool | None = None

class CuidadorHistorialOut(BaseModel):
    historial_id: int
    rut_cuidador: int
    fecha_cambio: datetime
    cambio: str | None = None
    resultado: bool | None = None
    class Config:
        from_attributes = True

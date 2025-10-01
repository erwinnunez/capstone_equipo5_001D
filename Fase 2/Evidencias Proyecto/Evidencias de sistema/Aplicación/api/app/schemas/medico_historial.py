from pydantic import BaseModel
from datetime import datetime

class MedicoHistorialCreate(BaseModel):
    rut_medico: int
    fecha_cambio: datetime | None = None
    cambio: str | None = None
    resultado: bool | None = None

class MedicoHistorialOut(BaseModel):
    historial_id: int
    rut_medico: int
    fecha_cambio: datetime
    cambio: str | None = None
    resultado: bool | None = None

    class Config:
        from_attributes = True

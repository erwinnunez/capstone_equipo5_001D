from pydantic import BaseModel
from datetime import datetime

class EventoGamificacionCreate(BaseModel):
    rut_paciente: int
    puntos: int
    fecha: datetime | None = None

class EventoGamificacionOut(BaseModel):
    id_evento: int
    rut_paciente: int
    puntos: int
    fecha: datetime
    class Config:
        from_attributes = True

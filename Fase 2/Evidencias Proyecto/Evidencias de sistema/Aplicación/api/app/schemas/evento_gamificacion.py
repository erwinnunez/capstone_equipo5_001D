from pydantic import BaseModel
from datetime import datetime

class EventoGamificacionCreate(BaseModel):
    rut_paciente: int
    tipo: str
    puntos: int
    fecha: datetime

class EventoGamificacionOut(BaseModel):
    id_evento: int
    rut_paciente: int
    tipo: str
    puntos: int
    fecha: datetime
    class Config:
        from_attributes = True

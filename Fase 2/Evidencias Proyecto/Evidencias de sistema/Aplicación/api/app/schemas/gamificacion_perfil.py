from pydantic import BaseModel
from datetime import datetime

class GamificacionPerfilCreate(BaseModel):
    rut_paciente: int
    puntos: int
    racha_dias: int
    ultima_actividad: datetime

class GamificacionPerfilUpdate(BaseModel):
    puntos: int | None = None
    racha_dias: int | None = None
    ultima_actividad: datetime | None = None

class GamificacionPerfilOut(BaseModel):
    rut_paciente: int
    puntos: int
    racha_dias: int
    ultima_actividad: datetime
    class Config:
        from_attributes = True

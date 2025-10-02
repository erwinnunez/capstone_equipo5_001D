from pydantic import BaseModel
from datetime import datetime

class PacienteCuidadorCreate(BaseModel):
    rut_paciente: int
    rut_cuidador: int
    relacion: str | None = None
    fecha_fin: datetime | None = None

class PacienteCuidadorUpdate(BaseModel):
    relacion: str | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    activo: bool | None = None

class PacienteCuidadorOut(BaseModel):
    id_pcuid: int
    rut_paciente: int
    rut_cuidador: int
    relacion: str | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    activo: bool
    class Config:
        from_attributes = True

from pydantic import BaseModel
from datetime import datetime

class PacienteCuidadorCreate(BaseModel):
    rut_paciente: int
    rut_cuidador: int
    permiso_registro: bool
    permiso_lectura: bool
    fecha_inicio: datetime
    fecha_fin: datetime
    activo: bool

class PacienteCuidadorUpdate(BaseModel):
    permiso_registro: bool | None = None
    permiso_lectura: bool | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    activo: bool | None = None

class PacienteCuidadorOut(BaseModel):
    rut_paciente: int
    rut_cuidador: int
    permiso_registro: bool
    permiso_lectura: bool
    fecha_inicio: datetime
    fecha_fin: datetime
    activo: bool
    class Config:
        from_attributes = True

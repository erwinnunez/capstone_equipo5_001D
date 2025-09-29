from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PacienteCuidadorBase(BaseModel):
    rut_paciente: int
    rut_cuidador: int
    permiso_registro: bool = False
    permiso_lectura: bool = True
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    activo: bool = True

class PacienteCuidadorCreate(PacienteCuidadorBase):
    pass

class PacienteCuidadorRead(PacienteCuidadorBase):
    id: int

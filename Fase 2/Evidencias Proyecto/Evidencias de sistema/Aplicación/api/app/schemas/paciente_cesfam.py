from pydantic import BaseModel
from datetime import datetime

class PacienteCesfamCreate(BaseModel):
    rut_paciente: int
    id_cesfam: int
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    activo: bool = True

class PacienteCesfamUpdate(BaseModel):
    id_cesfam: int | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    activo: bool | None = None

class PacienteCesfamOut(BaseModel):
    id_pc: int
    rut_paciente: int
    id_cesfam: int
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    activo: bool
    class Config:
        from_attributes = True

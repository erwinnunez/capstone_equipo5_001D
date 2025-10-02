from pydantic import BaseModel
from datetime import datetime

class MedicinaDetalleCreate(BaseModel):
    id_medicina: int
    rut_paciente: int
    dosis: str
    instrucciones_toma: str
    fecha_inicio: datetime
    fecha_fin: datetime
    tomada: bool

class MedicinaDetalleUpdate(BaseModel):
    id_medicina: int | None = None
    rut_paciente: int | None = None
    dosis: str | None = None
    instrucciones_toma: str | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    tomada: bool | None = None

class MedicinaDetalleOut(BaseModel):
    id_detalle: int
    id_medicina: int
    rut_paciente: int
    dosis: str
    instrucciones_toma: str
    fecha_inicio: datetime
    fecha_fin: datetime
    tomada: bool
    class Config:
        from_attributes = True

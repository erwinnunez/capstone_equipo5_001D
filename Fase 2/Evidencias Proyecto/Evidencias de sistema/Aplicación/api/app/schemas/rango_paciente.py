from pydantic import BaseModel
from datetime import datetime

class RangoPacienteCreate(BaseModel):
    rut_paciente: int
    id_parametro: int
    min_normal: int
    max_normal: int
    min_critico: int
    max_critico: int
    vigencia_desde: datetime
    vigencia_hasta: datetime
    version: int
    definido_por: bool

class RangoPacienteUpdate(BaseModel):
    min_normal: int | None = None
    max_normal: int | None = None
    min_critico: int | None = None
    max_critico: int | None = None
    vigencia_desde: datetime | None = None
    vigencia_hasta: datetime | None = None
    version: int | None = None
    definido_por: bool | None = None

class RangoPacienteOut(BaseModel):
    id_rango: int
    rut_paciente: int
    id_parametro: int
    min_normal: int
    max_normal: int
    min_critico: int
    max_critico: int
    vigencia_desde: datetime
    vigencia_hasta: datetime
    version: int
    definido_por: bool
    class Config:
        from_attributes = True

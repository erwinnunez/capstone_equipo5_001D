from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from .medicion_detalle import MedicionDetalleCreate, MedicionDetalleOut

class MedicionCreate(BaseModel):
    rut_paciente: int
    id_parametro: int
    valor_num: Optional[float] = None
    valor_txt: Optional[str] = None
    severidad_max: Optional[int] = None
    resumen_alerta: Optional[str] = None
    detalles: List[MedicionDetalleCreate] = []

class MedicionUpdate(BaseModel):
    rut_paciente: Optional[int] = None
    id_parametro: Optional[int] = None
    valor_num: Optional[float] = None
    valor_txt: Optional[str] = None
    fecha_lectura: Optional[datetime] = None
    enviada_bn: Optional[bool] = None
    severidad_max: Optional[int] = None
    resumen_alerta: Optional[str] = None

class MedicionOut(BaseModel):
    id_registro: int
    rut_paciente: int
    id_parametro: int
    valor_num: Optional[float] = None
    valor_txt: Optional[str] = None
    fecha_lectura: datetime
    enviada_bn: bool
    severidad_max: Optional[int] = None
    resumen_alerta: Optional[str] = None
    detalles: List[MedicionDetalleOut] = []
    class Config:
        from_attributes = True

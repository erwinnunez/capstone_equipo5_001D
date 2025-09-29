from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MedicionDetalleIn(BaseModel):
    id_parametro: int
    valor_num: Optional[float] = None
    valor_txt: Optional[str] = None
    umbral_min: Optional[int] = None
    umbral_max: Optional[int] = None

class MedicionBase(BaseModel):
    rut_paciente: int
    id_parametro: int
    valor_num: Optional[float] = None
    valor_txt: Optional[str] = None
    fecha_lectura: Optional[datetime] = None
    enviada_bn: bool = False
    severidad_max: Optional[int] = None
    resumen_alerta: Optional[str] = None

class MedicionCreate(MedicionBase):
    detalles: List[MedicionDetalleIn] = []

class MedicionRead(MedicionBase):
    id_registro: int

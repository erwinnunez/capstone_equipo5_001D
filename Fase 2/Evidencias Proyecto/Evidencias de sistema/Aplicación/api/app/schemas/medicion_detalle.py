from pydantic import BaseModel
from typing import Optional

class MedicionDetalleCreate(BaseModel):
    id_registro: int
    id_parametro: int
    valor_num: Optional[float] = None
    valor_txt: Optional[str] = None
    umbral_min: Optional[int] = None
    umbral_max: Optional[int] = None

class MedicionDetalleUpdate(BaseModel):
    id_parametro: Optional[int] = None
    valor_num: Optional[float] = None
    valor_txt: Optional[str] = None
    umbral_min: Optional[int] = None
    umbral_max: Optional[int] = None

class MedicionDetalleOut(BaseModel):
    id_detalle: int
    id_registro: int
    id_parametro: int
    valor_num: Optional[float] = None
    valor_txt: Optional[str] = None
    umbral_min: Optional[int] = None
    umbral_max: Optional[int] = None
    class Config:
        from_attributes = True

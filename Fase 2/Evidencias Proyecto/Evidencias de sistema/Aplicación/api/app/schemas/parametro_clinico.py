from pydantic import BaseModel
from typing import Optional

class ParametroClinicoBase(BaseModel):
    id_unidad: int
    codigo: str
    descripcion: str
    rango_ref_min: Optional[int] = None
    rango_ref_max: Optional[int] = None
    activo: bool = True

class ParametroClinicoCreate(ParametroClinicoBase):
    pass

class ParametroClinicoRead(ParametroClinicoBase):
    id_parametro: int

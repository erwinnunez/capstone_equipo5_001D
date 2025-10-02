from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MedicinaDetalleCreate(BaseModel):

    id_medicina: int         
    rut_paciente: int       
    fecha_inicio: datetime
    fecha_fin: datetime

class MedicinaDetalleUpdate(BaseModel):
    fecha_fin: Optional[datetime] = None
    tomada: Optional[bool] = None 
    
class MedicinaDetalleOut(BaseModel):
    id_detalle: int
    id_medicina: int
    rut_paciente: int
    fecha_inicio: datetime
    fecha_fin: datetime
    tomada: bool
    fecha_registro: datetime
    class Config:
        from_attributes = True    
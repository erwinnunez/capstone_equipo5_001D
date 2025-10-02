from pydantic import BaseModel
from typing import Optional

class MedicinaCreate(BaseModel):
    nombre: str
    dosis: int
    instrucciones: str = None

class MedicinaCreateUpdate(BaseModel): 
    nombre: Optional[str] = None
    dosis: Optional[str] = None
    instrucciones: Optional[str] = None

class MedicinaOut(BaseModel):
    id_medicina: int 
    nombre: str
    dosis: str
    instrucciones: str
    class Config:
        from_attributes = True

class Medicinaporpaciente(BaseModel):
    rut_paciente: int
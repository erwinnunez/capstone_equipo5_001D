from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TareaBase(BaseModel):
    descripcion: str
    nota_cuidador: Optional[str] = None

class TareaCreate(TareaBase):
    rut_paciente: int
    rut_doctor: int
    rut_cuidador: Optional[int] = None

class TareaUpdate(BaseModel):
    descripcion: Optional[str] = None
    completado: Optional[datetime] = None
    nota_cuidador: Optional[str] = None

class TareaOut(TareaBase):
    id_tarea: int
    rut_paciente: int
    rut_doctor: int
    rut_cuidador: Optional[int]
    creado: datetime
    completado: Optional[datetime]

    class Config:
        orm_mode = True
from pydantic import BaseModel
from datetime import datetime

class NotaClinicaCreate(BaseModel):
    rut_paciente: int
    rut_medico: int
    tipo_autor: str
    nota: str
    tipo_nota: str
    creada_en: datetime

class NotaClinicaUpdate(BaseModel):
    tipo_autor: str | None = None
    nota: str | None = None
    tipo_nota: str | None = None
    creada_en: datetime | None = None

class NotaClinicaOut(BaseModel):
    id_nota: int
    rut_paciente: int
    rut_medico: int
    tipo_autor: str
    nota: str
    tipo_nota: str
    creada_en: datetime
    class Config:
        from_attributes = True

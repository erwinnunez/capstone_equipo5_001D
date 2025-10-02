from pydantic import BaseModel
from datetime import datetime

class UsuarioInsigniaCreate(BaseModel):
    rut_paciente: int

class UsuarioInsigniaOut(BaseModel):
    rut_paciente: int
    id_insignia: int
    otorgada_en: datetime
    class Config:
        from_attributes = True

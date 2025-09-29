from pydantic import BaseModel
from typing import Optional

class CuidadorBase(BaseModel):
    rut_cuidador: int
    nombre_cuidador: str
    apellido_cuidador: str
    sexo: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    estado: bool = True

class CuidadorCreate(CuidadorBase):
    pass

class CuidadorRead(CuidadorBase):
    pass

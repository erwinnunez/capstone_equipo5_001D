from pydantic import BaseModel
from typing import Optional
from datetime import date

class PacienteBase(BaseModel):
    rut_paciente: int
    id_comuna: int
    nombre_paciente: str
    apellido_paciente: str
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[str] = None
    tipo_sangre: Optional[str] = None
    enfermedades: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    foto_paciente: Optional[str] = None
    nombre_contacto: Optional[str] = None
    telefono_contacto: Optional[str] = None
    estado: bool = True

class PacienteCreate(PacienteBase):
    pass

class PacienteRead(PacienteBase):
    pass

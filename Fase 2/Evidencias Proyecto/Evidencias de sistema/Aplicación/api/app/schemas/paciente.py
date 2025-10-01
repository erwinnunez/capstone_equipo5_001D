from pydantic import BaseModel
from datetime import date

class PacienteCreate(BaseModel):
    rut_paciente: int
    nombre_paciente: str
    apellido_paciente: str
    sexo: str | None = None
    fecha_nacimiento: date | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None
    estado: bool = True

class PacienteUpdate(BaseModel):
    nombre_paciente: str | None = None
    apellido_paciente: str | None = None
    sexo: str | None = None
    fecha_nacimiento: date | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None
    estado: bool | None = None

class PacienteOut(BaseModel):
    rut_paciente: int
    nombre_paciente: str
    apellido_paciente: str
    sexo: str | None = None
    fecha_nacimiento: date | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None
    estado: bool
    class Config:
        from_attributes = True

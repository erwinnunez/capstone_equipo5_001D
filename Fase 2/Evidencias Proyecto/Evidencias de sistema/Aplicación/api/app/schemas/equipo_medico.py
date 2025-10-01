from pydantic import BaseModel

class EquipoMedicoCreate(BaseModel):
    rut_medico: int
    id_cesfam: int
    nombre_medico: str
    apellido_medico: str
    telefono: str | None = None
    direccion: str | None = None
    email: str | None = None
    especialidad: str | None = None
    estado: bool = True

class EquipoMedicoUpdate(BaseModel):
    id_cesfam: int | None = None
    nombre_medico: str | None = None
    apellido_medico: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    email: str | None = None
    especialidad: str | None = None
    estado: bool | None = None

class EquipoMedicoOut(BaseModel):
    rut_medico: int
    id_cesfam: int
    nombre_medico: str
    apellido_medico: str
    telefono: str | None = None
    direccion: str | None = None
    email: str | None = None
    especialidad: str | None = None
    estado: bool
    class Config:
        from_attributes = True

from pydantic import BaseModel

class CuidadorCreate(BaseModel):
    rut_cuidador: int
    nombre_cuidador: str
    apellido_cuidador: str
    sexo: str | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None
    estado: bool = True

class CuidadorUpdate(BaseModel):
    nombre_cuidador: str | None = None
    apellido_cuidador: str | None = None
    sexo: str | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None
    estado: bool | None = None

class CuidadorOut(BaseModel):
    rut_cuidador: int
    nombre_cuidador: str
    apellido_cuidador: str
    sexo: str | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: str | None = None
    estado: bool
    class Config:
        from_attributes = True

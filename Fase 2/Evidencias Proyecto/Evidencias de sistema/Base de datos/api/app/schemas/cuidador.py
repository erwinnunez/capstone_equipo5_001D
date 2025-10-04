from pydantic import BaseModel

# -------- Create / Update / Out --------
class CuidadorCreate(BaseModel):
    rut_cuidador: int
    primer_nombre_cuidador: str
    segundo_nombre_cuidador: str
    primer_apellido_cuidador: str
    segundo_apellido_cuidador: str
    sexo: bool
    direccion: str
    telefono: int
    email: str
    contrasena: str
    estado: bool

class CuidadorUpdate(BaseModel):
    primer_nombre_cuidador: str | None = None
    segundo_nombre_cuidador: str | None = None
    primer_apellido_cuidador: str | None = None
    segundo_apellido_cuidador: str | None = None
    sexo: bool | None = None
    direccion: str | None = None
    telefono: int | None = None
    email: str | None = None
    contrasena: str | None = None
    estado: bool | None = None

class CuidadorOut(BaseModel):
    rut_cuidador: int
    primer_nombre_cuidador: str
    segundo_nombre_cuidador: str
    primer_apellido_cuidador: str
    segundo_apellido_cuidador: str
    sexo: bool
    direccion: str
    telefono: int
    email: str
    contrasena: str
    estado: bool
    class Config:
        from_attributes = True

# -------- List filters (paginación + búsqueda) --------
class CuidadorListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    estado: bool | None = True  # por defecto, solo activos

    # búsqueda por nombres/apellidos
    primer_nombre: str | None = None
    segundo_nombre: str | None = None
    primer_apellido: str | None = None
    segundo_apellido: str | None = None

# -------- Habilitar / Deshabilitar --------
class CuidadorSetEstado(BaseModel):
    habilitar: bool

from pydantic import BaseModel

# -------- Create / Update / Out --------
class EquipoMedicoCreate(BaseModel):
    rut_medico: int
    id_cesfam: int
    primer_nombre_medico: str
    segundo_nombre_medico: str
    primer_apellido_medico: str
    segundo_apellido_medico: str
    email: str
    contrasenia: str
    telefono: int
    direccion: str
    rol: str
    especialidad: str
    estado: bool

class EquipoMedicoUpdate(BaseModel):
    id_cesfam: int | None = None
    primer_nombre_medico: str | None = None
    segundo_nombre_medico: str | None = None
    primer_apellido_medico: str | None = None
    segundo_apellido_medico: str | None = None
    email: str | None = None
    contrasenia: str | None = None
    telefono: int | None = None
    direccion: str | None = None
    rol: str | None = None
    especialidad: str | None = None
    estado: bool | None = None

class EquipoMedicoOut(BaseModel):
    rut_medico: int
    id_cesfam: int
    primer_nombre_medico: str
    segundo_nombre_medico: str
    primer_apellido_medico: str
    segundo_apellido_medico: str
    email: str
    contrasenia: str
    telefono: int
    direccion: str
    rol: str
    especialidad: str
    estado: bool
    class Config:
        from_attributes = True

# -------- List filters (paginación + búsqueda) --------
class EquipoMedicoListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    id_cesfam: int | None = None
    estado: bool | None = True  # por defecto, solo activos

    # búsqueda por nombres/apellidos
    primer_nombre: str | None = None
    segundo_nombre: str | None = None
    primer_apellido: str | None = None
    segundo_apellido: str | None = None

# -------- Habilitar / Deshabilitar --------
class EquipoMedicoSetEstado(BaseModel):
    habilitar: bool

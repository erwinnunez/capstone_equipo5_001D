from pydantic import BaseModel
from datetime import datetime

# -------- Create / Update / Out --------
class PacienteCreate(BaseModel):
    rut_paciente: int
    id_comuna: int

    primer_nombre_paciente: str
    segundo_nombre_paciente: str
    primer_apellido_paciente: str
    segundo_apellido_paciente: str

    fecha_nacimiento: datetime
    sexo: bool
    tipo_de_sangre: str
    enfermedades: str
    seguro: str

    direccion: str
    telefono: int
    email: str
    contrasena: str

    tipo_paciente: str
    nombre_contacto: str
    telefono_contacto: int

    estado: bool

    id_cesfam: int
    fecha_inicio_cesfam: datetime
    fecha_fin_cesfam: datetime | None = None
    activo_cesfam: bool

class PacienteUpdate(BaseModel):
    id_comuna: int | None = None
    primer_nombre_paciente: str | None = None
    segundo_nombre_paciente: str | None = None
    primer_apellido_paciente: str | None = None
    segundo_apellido_paciente: str | None = None
    fecha_nacimiento: datetime | None = None
    sexo: bool | None = None
    tipo_de_sangre: str | None = None
    enfermedades: str | None = None
    seguro: str | None = None
    direccion: str | None = None
    telefono: int | None = None
    email: str | None = None
    contrasena: str | None = None
    tipo_paciente: str | None = None
    nombre_contacto: str | None = None
    telefono_contacto: int | None = None
    estado: bool | None = None
    id_cesfam: int | None = None
    fecha_inicio_cesfam: datetime | None = None
    fecha_fin_cesfam: datetime | None = None
    activo_cesfam: bool | None = None

class PacienteOut(BaseModel):
    rut_paciente: int
    id_comuna: int
    primer_nombre_paciente: str
    segundo_nombre_paciente: str
    primer_apellido_paciente: str
    segundo_apellido_paciente: str
    fecha_nacimiento: datetime
    sexo: bool
    tipo_de_sangre: str
    enfermedades: str
    seguro: str
    direccion: str
    telefono: int
    email: str
    contrasena: str
    tipo_paciente: str
    nombre_contacto: str
    telefono_contacto: int
    estado: bool
    id_cesfam: int
    fecha_inicio_cesfam: datetime
    fecha_fin_cesfam: datetime | None = None
    activo_cesfam: bool
    class Config:
        from_attributes = True

# -------- List filters (paginación + búsqueda) --------
class PacienteListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    id_cesfam: int | None = None
    id_comuna: int | None = None
    estado: bool | None = True  # por defecto, solo activos

    # búsqueda por nombres/apellidos
    primer_nombre: str | None = None
    segundo_nombre: str | None = None
    primer_apellido: str | None = None
    segundo_apellido: str | None = None

# -------- Habilitar / Deshabilitar --------
class PacienteSetEstado(BaseModel):
    habilitar: bool

from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime, date
import re

_RUT_RE = re.compile(r"^\d{7,8}[0-9K]$")

def _validate_rut_plain(v: str) -> str:
    v = (v or "").upper()
    if not _RUT_RE.fullmatch(v):
        raise ValueError("RUT debe venir SIN puntos ni guion (ej: 12345678K).")
    cuerpo, dv = v[:-1], v[-1]
    s, f = 0, 2
    for ch in reversed(cuerpo):
        s += int(ch)*f
        f = 2 if f == 7 else f+1
    r = 11 - (s % 11)
    dv_ok = "0" if r == 11 else ("K" if r == 10 else str(r))
    if dv_ok != dv:
        raise ValueError("RUT inválido: DV no coincide.")
    return v

class PacienteCreate(BaseModel):
    rut_paciente: str = Field(..., example="12345678K")
    id_comuna: int
    primer_nombre_paciente: str = Field(..., min_length=3, max_length=50)
    segundo_nombre_paciente: str = Field(..., min_length=3, max_length=50)
    primer_apellido_paciente: str = Field(..., min_length=3, max_length=50)
    segundo_apellido_paciente: str = Field(..., min_length=3, max_length=50)
    fecha_nacimiento: date
    sexo: bool
    tipo_de_sangre: str = Field(pattern=r"^(A|B|AB|O)[+-]$", example="O+")
    enfermedades: str | None = None
    seguro: str | None = None
    direccion: str = Field(..., min_length=5, max_length=150)
    telefono: int = Field(..., example="961072806")
    email: EmailStr
    contrasena: str = Field(..., min_length=8, max_length=64)
    tipo_paciente: str = Field(..., example="Crónico")
    nombre_contacto: str = Field(..., min_length=3, max_length=100)
    telefono_contacto: int = Field(..., example="988887777")
    estado: bool
    id_cesfam: int
    fecha_inicio_cesfam: date
    fecha_fin_cesfam: date | None = None
    activo_cesfam: bool

    @field_validator("rut_paciente")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @field_validator(
        "primer_nombre_paciente", "segundo_nombre_paciente",
        "primer_apellido_paciente", "segundo_apellido_paciente"
    )
    @classmethod
    def _val_nombres(cls, v: str) -> str:
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Los nombres y apellidos solo pueden contener letras y espacios")
        return v.strip().title()

    @field_validator("fecha_nacimiento")
    @classmethod
    def _val_fnac(cls, v: date) -> date:
        hoy = date.today()
        if v > hoy:
            raise ValueError("La fecha de nacimiento no puede ser futura")
        if (hoy.year - v.year) > 120:
            raise ValueError("La edad no puede superar los 120 años")
        return v

    @field_validator("telefono", "telefono_contacto")
    @classmethod
    def _val_fonos(cls, v: int) -> int:
        s = str(v)
        if not s.isdigit() or len(s) != 9:
            raise ValueError("El número debe tener exactamente 9 dígitos.")
        return v

    @field_validator("direccion")
    @classmethod
    def _val_dir(cls, v: str) -> str:
        permitidos = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,#- ")
        if not all(c in permitidos for c in v):
            raise ValueError("La dirección solo puede contener letras, números y ., #-")
        return v.strip().title()

    @field_validator("contrasena")
    @classmethod
    def _val_pass(cls, v: str) -> str:
        if len(v) < 8: raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not any(c.isupper() for c in v): raise ValueError("Debe tener al menos una letra mayúscula")
        if not any(c.islower() for c in v): raise ValueError("Debe tener al menos una letra minúscula")
        if not any(c.isdigit() for c in v): raise ValueError("Debe tener al menos un número")
        return v

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

    @field_validator(
        "primer_nombre_paciente", "segundo_nombre_paciente",
        "primer_apellido_paciente", "segundo_apellido_paciente"
    )
    @classmethod
    def _val_nombres_upd(cls, v: str | None):
        if v and not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Los nombres y apellidos solo pueden contener letras y espacios")
        return v.strip().title() if v else v

    @field_validator("telefono", "telefono_contacto")
    @classmethod
    def _val_fonos_upd(cls, v: int | None):
        if v is None: return v
        s = str(v)
        if not s.isdigit() or len(s) != 9:
            raise ValueError("El número debe tener exactamente 9 dígitos.")
        return v

    @field_validator("direccion")
    @classmethod
    def _val_dir_upd(cls, v: str | None):
        if v is None: return v
        permitidos = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,#- ")
        if not all(c in permitidos for c in v):
            raise ValueError("La dirección solo puede contener letras, números y ., #-")
        return v.strip().title()

    @field_validator("contrasena")
    @classmethod
    def _val_pass_upd(cls, v: str | None):
        if v is None: return v
        if len(v) < 8: raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not any(c.isupper() for c in v): raise ValueError("Debe tener al menos una letra mayúscula")
        if not any(c.islower() for c in v): raise ValueError("Debe tener al menos una letra minúscula")
        if not any(c.isdigit() for c in v): raise ValueError("Debe tener al menos un número")
        return v

class PacienteOut(BaseModel):
    rut_paciente: str
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

class PacienteListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    id_cesfam: int | None = None
    id_comuna: int | None = None
    estado: bool | None = True
    primer_nombre: str | None = None
    segundo_nombre: str | None = None
    primer_apellido: str | None = None
    segundo_apellido: str | None = None

class PacienteSetEstado(BaseModel):
    habilitar: bool

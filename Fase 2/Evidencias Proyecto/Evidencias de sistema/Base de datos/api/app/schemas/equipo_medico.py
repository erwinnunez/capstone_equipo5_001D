from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
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

class EquipoMedicoCreate(BaseModel):
    rut_medico: str = Field(..., example="12345678K", description="RUT sin puntos ni guion")
    id_cesfam: int = Field(..., gt=0)
    primer_nombre_medico: str = Field(..., min_length=3, max_length=50)
    segundo_nombre_medico: Optional[str] = Field(None, min_length=3, max_length=50)
    primer_apellido_medico: str = Field(..., min_length=3, max_length=50)
    segundo_apellido_medico: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(..., example="medico@salud.cl")
    contrasenia: str = Field(..., min_length=8, description="Mínimo 8 caracteres")
    telefono: int = Field(..., example="987654321")
    direccion: str = Field(..., min_length=5, max_length=100)
    rol: str = Field(..., min_length=3, max_length=50)
    especialidad: str = Field(..., min_length=3, max_length=50)
    estado: bool
    is_admin: bool = False

    @field_validator("rut_medico")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @field_validator("telefono")
    @classmethod
    def _val_fono(cls, v: int) -> int:
        s = str(v)
        if not s.isdigit() or len(s) != 9:
            raise ValueError("El número debe tener exactamente 9 dígitos.")
        return v

    @field_validator(
        "primer_nombre_medico", "segundo_nombre_medico",
        "primer_apellido_medico", "segundo_apellido_medico"
    )
    @classmethod
    def _val_nombres(cls, v: Optional[str]) -> Optional[str]:
        if v and not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Solo se permiten letras y espacios")
        return v.title() if v else v

    @field_validator("direccion")
    @classmethod
    def _val_dir(cls, v: str) -> str:
        permitidos = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,#- ")
        if not all(c in permitidos for c in v):
            raise ValueError("La dirección solo puede contener letras, números y ., #-")
        return v.strip().title()

    @field_validator("contrasenia")
    @classmethod
    def _val_pass(cls, v: str) -> str:
        if len(v) < 8: raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not any(c.isupper() for c in v): raise ValueError("Debe tener al menos una letra mayúscula")
        if not any(c.islower() for c in v): raise ValueError("Debe tener al menos una letra minúscula")
        if not any(c.isdigit() for c in v): raise ValueError("Debe tener al menos un número")
        return v

class EquipoMedicoUpdate(BaseModel):
    rut_medico: Optional[str] = None
    id_cesfam: Optional[int] = Field(None, gt=0)
    primer_nombre_medico: Optional[str] = Field(None, min_length=3, max_length=50)
    segundo_nombre_medico: Optional[str] = Field(None, min_length=3, max_length=50)
    primer_apellido_medico: Optional[str] = Field(None, min_length=3, max_length=50)
    segundo_apellido_medico: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = Field(None, example="medico@salud.cl")
    contrasenia: Optional[str] = Field(None, min_length=8, description="Mínimo 8 caracteres")
    telefono: Optional[int] = Field(None, example="987654321")
    direccion: Optional[str] = Field(None, min_length=5, max_length=100)
    rol: Optional[str] = Field(None, min_length=3, max_length=50)
    especialidad: Optional[str] = Field(None, min_length=3, max_length=50)
    estado: Optional[bool] = None
    is_admin: Optional[bool] = None

    @field_validator("rut_medico")
    @classmethod
    def _val_rut_upd(cls, v: Optional[str]) -> Optional[str]:
        if v is None: return v
        return _validate_rut_plain(v)

    @field_validator("telefono")
    @classmethod
    def _val_fono_upd(cls, v: Optional[int]) -> Optional[int]:
        if v is None: return v
        s = str(v)
        if not s.isdigit() or len(s) != 9:
            raise ValueError("El número debe tener exactamente 9 dígitos.")
        return v

    @field_validator(
        "primer_nombre_medico", "segundo_nombre_medico",
        "primer_apellido_medico", "segundo_apellido_medico"
    )
    @classmethod
    def _val_nombres_upd(cls, v: Optional[str]) -> Optional[str]:
        if v and not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Solo se permiten letras y espacios")
        return v.title() if v else v

    @field_validator("direccion")
    @classmethod
    def _val_dir_upd(cls, v: Optional[str]) -> Optional[str]:
        if v is None: return v
        permitidos = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,#- ")
        if not all(c in permitidos for c in v):
            raise ValueError("La dirección solo puede contener letras, números y ., #-")
        return v.strip().title()

    @field_validator("contrasenia")
    @classmethod
    def _val_pass_upd(cls, v: Optional[str]) -> Optional[str]:
        if v is None: return v
        if len(v) < 8: raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not any(c.isupper() for c in v): raise ValueError("Debe tener al menos una letra mayúscula")
        if not any(c.islower() for c in v): raise ValueError("Debe tener al menos una letra minúscula")
        if not any(c.isdigit() for c in v): raise ValueError("Debe tener al menos un número")
        return v

class EquipoMedicoOut(BaseModel):
    rut_medico: str
    id_cesfam: int
    primer_nombre_medico: str
    segundo_nombre_medico: str
    primer_apellido_medico: str
    segundo_apellido_medico: str
    email: str
    telefono: int
    direccion: str
    rol: str
    especialidad: str
    estado: bool
    is_admin: bool

    class Config:
        from_attributes = True

class EquipoMedicoListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    id_cesfam: int | None = None
    estado: bool | None = True
    primer_nombre: str | None = None
    segundo_nombre: str | None = None
    primer_apellido: str | None = None
    segundo_apellido: str | None = None

class EquipoMedicoSetEstado(BaseModel):
    habilitar: bool

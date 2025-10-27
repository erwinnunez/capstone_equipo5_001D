from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
import re

# ===== RUT plano: sin puntos ni guion, DV 0-9 o K =====
_RUT_RE = re.compile(r"^\d{7,8}[0-9K]$")

def _validate_rut_plain(v: str) -> str:
    v = (v or "").upper()
    if not _RUT_RE.fullmatch(v):
        raise ValueError("RUT debe venir SIN puntos ni guion y terminar en DV (ej: 12345678K).")
    cuerpo, dv = v[:-1], v[-1]
    s, f = 0, 2
    for ch in reversed(cuerpo):
        s += int(ch) * f
        f = 2 if f == 7 else f + 1
    r = 11 - (s % 11)
    dv_ok = "0" if r == 11 else ("K" if r == 10 else str(r))
    if dv_ok != dv:
        raise ValueError("RUT inválido: el dígito verificador no coincide.")
    return v

class CuidadorCreate(BaseModel):
    rut_cuidador: str = Field(..., example="12345678K")
    primer_nombre_cuidador: str = Field(..., min_length=3, max_length=60)
    segundo_nombre_cuidador: str = Field(..., min_length=3, max_length=60)
    primer_apellido_cuidador: str = Field(..., min_length=3, max_length=60)
    segundo_apellido_cuidador: str = Field(..., min_length=3, max_length=60)
    sexo: bool
    direccion: str = Field(..., min_length=5, max_length=150)
    telefono: int = Field(..., example="999998888")
    email: EmailStr
    contrasena: str = Field(..., min_length=8, max_length=64)
    estado: bool

    @field_validator("rut_cuidador")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @field_validator(
        "primer_nombre_cuidador", "segundo_nombre_cuidador",
        "primer_apellido_cuidador", "segundo_apellido_cuidador"
    )
    @classmethod
    def _val_nombres(cls, v: str) -> str:
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Los nombres y apellidos solo pueden contener letras y espacios")
        return v.strip().title()

    @field_validator("telefono")
    @classmethod
    def _val_fono(cls, v: int) -> int:
        s = str(v)
        if not s.isdigit() or len(s) != 9:
            raise ValueError("El número debe tener exactamente 9 dígitos.")
        return v

    @field_validator("direccion")
    @classmethod
    def _val_dir(cls, v: str) -> str:
        permitidos = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,#- ")
        if not all(c in permitidos for c in v):
            raise ValueError("La dirección solo puede contener letras, números y los caracteres ., #-")
        return v.strip().title()

    @field_validator("contrasena")
    @classmethod
    def _val_pass(cls, v: str) -> str:
        if len(v) < 8: raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not any(c.isupper() for c in v): raise ValueError("Debe tener al menos una letra mayúscula")
        if not any(c.islower() for c in v): raise ValueError("Debe tener al menos una letra minúscula")
        if not any(c.isdigit() for c in v): raise ValueError("Debe tener al menos un número")
        return v

class CuidadorUpdate(BaseModel):
    primer_nombre_cuidador: Optional[str] = Field(None, min_length=3, max_length=60)
    segundo_nombre_cuidador: Optional[str] = Field(None, min_length=3, max_length=60)
    primer_apellido_cuidador: Optional[str] = Field(None, min_length=3, max_length=60)
    segundo_apellido_cuidador: Optional[str] = Field(None, min_length=3, max_length=60)
    sexo: Optional[bool] = None
    direccion: Optional[str] = Field(None, min_length=5, max_length=150)
    telefono: Optional[int] = Field(None, example="999998888")
    email: Optional[EmailStr] = None
    contrasena: Optional[str] = None
    estado: Optional[bool] = None

    @field_validator(
        "primer_nombre_cuidador", "segundo_nombre_cuidador",
        "primer_apellido_cuidador", "segundo_apellido_cuidador"
    )
    @classmethod
    def _val_nombres_upd(cls, v: Optional[str]) -> Optional[str]:
        if v is None: return v
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("Los nombres y apellidos solo pueden contener letras y espacios")
        return v.strip().title()

    @field_validator("telefono")
    @classmethod
    def _val_fono_upd(cls, v: Optional[int]) -> Optional[int]:
        if v is None: return v
        s = str(v)
        if not s.isdigit() or len(s) != 9:
            raise ValueError("El número debe tener exactamente 9 dígitos.")
        return v

    @field_validator("direccion")
    @classmethod
    def _val_dir_upd(cls, v: Optional[str]) -> Optional[str]:
        if v is None: return v
        permitidos = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áéíóúÁÉÍÓÚñÑ.,#- ")
        if not all(c in permitidos for c in v):
            raise ValueError("La dirección solo puede contener letras, números y los caracteres ., #-")
        return v.strip().title()

    @field_validator("contrasena")
    @classmethod
    def _val_pass_upd(cls, v: Optional[str]) -> Optional[str]:
        if v is None: return v
        if len(v) < 8: raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not any(c.isupper() for c in v): raise ValueError("Debe tener al menos una letra mayúscula")
        if not any(c.islower() for c in v): raise ValueError("Debe tener al menos una letra minúscula")
        if not any(c.isdigit() for c in v): raise ValueError("Debe tener al menos un número")
        return v

class CuidadorOut(BaseModel):
    rut_cuidador: str
    primer_nombre_cuidador: str
    segundo_nombre_cuidador: str
    primer_apellido_cuidador: str
    segundo_apellido_cuidador: str
    sexo: bool
    direccion: str
    telefono: int
    email: str
    estado: bool

    class Config:
        from_attributes = True

class CuidadorListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    estado: bool | None = True
    primer_nombre: str | None = None
    segundo_nombre: str | None = None
    primer_apellido: str | None = None
    segundo_apellido: str | None = None

class CuidadorSetEstado(BaseModel):
    habilitar: bool

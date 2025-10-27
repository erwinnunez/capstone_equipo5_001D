from pydantic import BaseModel, Field, field_validator
from datetime import datetime
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

class EventoGamificacionCreate(BaseModel):
    rut_paciente: str = Field(..., example="12345678K")
    tipo: str = Field(..., min_length=3, max_length=100, example="Inicio de sesión")
    puntos: int = Field(..., ge=0, description="Cantidad de puntos ganados o perdidos")
    fecha: datetime = Field(..., description="Fecha y hora del evento")

    @field_validator("rut_paciente")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @field_validator("tipo")
    @classmethod
    def _val_tipo(cls, v: str) -> str:
        import re as _re
        if not _re.match(r"^[\w\sáéíóúÁÉÍÓÚñÑ-]+$", v):
            raise ValueError("El tipo de evento solo puede contener letras, números, espacios y guiones")
        return v.strip().title()

class EventoGamificacionOut(BaseModel):
    id_evento: int
    rut_paciente: str
    tipo: str
    puntos: int
    fecha: datetime

    class Config:
        from_attributes = True

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

class UsuarioInsigniaCreate(BaseModel):
    rut_paciente: str = Field(..., example="12345678K")
    id_insignia: int = Field(..., ge=1)
    otorgada_en: datetime

    @field_validator("rut_paciente")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

class UsuarioInsigniaOut(BaseModel):
    rut_paciente: str
    id_insignia: int
    otorgada_en: datetime

    class Config:
        from_attributes = True

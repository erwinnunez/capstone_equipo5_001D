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

class MedicoHistorialCreate(BaseModel):
    rut_medico: str = Field(..., example="12345678K")
    fecha_cambio: datetime
    cambio: str = Field(..., min_length=3, max_length=255)
    resultado: bool

    @field_validator("rut_medico")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @field_validator("cambio")
    @classmethod
    def _clean_cambio(cls, v: str):
        return v.strip().capitalize() if v else v

class MedicoHistorialOut(BaseModel):
    historial_id: int
    rut_medico: str
    fecha_cambio: datetime
    cambio: str
    resultado: bool

    class Config:
        from_attributes = True

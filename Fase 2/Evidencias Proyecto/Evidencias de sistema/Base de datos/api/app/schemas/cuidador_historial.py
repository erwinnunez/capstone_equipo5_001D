from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
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

class CuidadorHistorialCreate(BaseModel):
    rut_cuidador: str = Field(..., description="RUT del cuidador asociado (sin puntos ni guion)")
    fecha_cambio: datetime = Field(description="Fecha y hora del cambio realizado")
    cambio: str = Field(..., min_length=5, max_length=200, description="Descripción del cambio realizado")
    resultado: bool = Field(description="Indica si el cambio fue exitoso (True/False)")

    @field_validator("rut_cuidador")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @field_validator("fecha_cambio")
    @classmethod
    def _val_fecha(cls, v: datetime) -> datetime:
        now = datetime.now(timezone.utc)
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v > now:
            raise ValueError("La fecha de cambio no puede ser futura.")
        return v

    @field_validator("cambio")
    @classmethod
    def _val_cambio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El campo 'cambio' no puede estar vacío")
        return v.strip()

class CuidadorHistorialOut(BaseModel):
    historial_id: int
    rut_cuidador: str
    fecha_cambio: datetime
    cambio: str
    resultado: bool

    class Config:
        from_attributes = True

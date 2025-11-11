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

class GamificacionPerfilCreate(BaseModel):
    rut_paciente: str = Field(..., example="12345678K")
    puntos: int = Field(..., ge=0)
    racha_dias: int = Field(..., ge=0)
    ultima_actividad: datetime = Field(...)

    @field_validator("rut_paciente")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @field_validator("ultima_actividad")
    @classmethod
    def _val_fecha(cls, v: datetime) -> datetime:
        from datetime import datetime as _dt, timezone
        now = _dt.now(timezone.utc)
        # Si v es naive, lo convertimos a aware en UTC
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v > now:
            raise ValueError("La fecha de la última actividad no puede estar en el futuro")
        return v

class GamificacionPerfilUpdate(BaseModel):
    puntos: int | None = Field(None, ge=0)
    racha_dias: int | None = Field(None, ge=0)
    ultima_actividad: datetime | None = Field(None)

    @field_validator("ultima_actividad")
    @classmethod
    def _val_fecha_upd(cls, v: datetime | None):
        from datetime import datetime as _dt, timezone
        now = _dt.now(timezone.utc)
        if v:
            if v.tzinfo is None:
                v = v.replace(tzinfo=timezone.utc)
            if v > now:
                raise ValueError("La fecha de la última actividad no puede estar en el futuro")
        return v

class GamificacionPerfilOut(BaseModel):
    rut_paciente: str
    puntos: int
    racha_dias: int
    ultima_actividad: datetime

    class Config:
        from_attributes = True

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

class DescargaReporteCreate(BaseModel):
    rut_medico: str = Field(..., description="RUT del médico (sin puntos ni guion)")
    id_reporte: int = Field(..., gt=0, description="ID del reporte descargado")
    descargado_en: datetime = Field(description="Fecha y hora en que se descargó el reporte")

    @field_validator("rut_medico")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @field_validator("descargado_en")
    @classmethod
    def _val_fecha(cls, v: datetime) -> datetime:
        now = datetime.now(timezone.utc)
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v > now:
            raise ValueError("La fecha de descarga no puede ser futura.")
        return v

class DescargaReporteOut(BaseModel):
    id_descarga: int
    rut_medico: str
    id_reporte: int
    descargado_en: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field, field_validator, model_validator
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

class SolicitudReporteCreate(BaseModel):
    rut_medico: str = Field(..., example="12345678K")
    rut_paciente: str = Field(..., example="12345678K")
    rango_desde: datetime
    rango_hasta: datetime
    tipo: str
    formato: str
    estado: str
    creado_en: datetime

    @field_validator("rut_medico", "rut_paciente")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @model_validator(mode="after")
    def _ruts_diferentes(self):
        if self.rut_paciente == self.rut_medico:
            raise ValueError("El RUT del paciente y el del medico no pueden ser iguales.")
        return self

    @model_validator(mode="before")
    @classmethod
    def _val_rango(cls, values):
        d = values.get("rango_desde")
        h = values.get("rango_hasta")
        if d and h and h < d:
            raise ValueError("rango_hasta no puede ser anterior a rango_desde.")
        return values

class SolicitudReporteUpdate(BaseModel):
    rut_medico: str | None = None
    rut_paciente: str | None = None
    rango_desde: datetime | None = None
    rango_hasta: datetime | None = None
    tipo: str | None = None
    formato: str | None = None
    estado: str | None = None
    creado_en: datetime | None = None

    @field_validator("rut_medico", "rut_paciente")
    @classmethod
    def _val_rut_upd(cls, v: str | None) -> str | None:
        if v is None: return v
        return _validate_rut_plain(v)

    @model_validator(mode="after")
    def _ruts_diferentes_upd(self):
        if self.rut_paciente and self.rut_medico and self.rut_paciente == self.rut_medico:
            raise ValueError("El RUT del paciente y el del medico no pueden ser iguales.")
        return self

    @model_validator(mode="before")
    @classmethod
    def _val_rango_upd(cls, values):
        d = values.get("rango_desde")
        h = values.get("rango_hasta")
        if d and h and h < d:
            raise ValueError("rango_hasta no puede ser anterior a rango_desde.")
        return values

class SolicitudReporteOut(BaseModel):
    id_reporte: int
    rut_medico: str
    rut_paciente: str
    rango_desde: datetime
    rango_hasta: datetime
    tipo: str
    formato: str
    estado: str
    creado_en: datetime

    class Config:
        from_attributes = True

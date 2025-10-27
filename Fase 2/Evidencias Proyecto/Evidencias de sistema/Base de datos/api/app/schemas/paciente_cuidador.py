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

class PacienteCuidadorCreate(BaseModel):
    rut_paciente: str = Field(..., example="12345678K")
    rut_cuidador: str = Field(..., example="87654321K")
    permiso_registro: bool
    permiso_lectura: bool
    fecha_inicio: datetime
    fecha_fin: datetime
    activo: bool

    @field_validator("rut_paciente", "rut_cuidador")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @model_validator(mode="after")
    def _ruts_diferentes(self):
        if self.rut_paciente == self.rut_cuidador:
            raise ValueError("El RUT del paciente y el del cuidador no pueden ser iguales.")
        return self

    @model_validator(mode="after")
    def _fechas(self):
        if self.fecha_fin and self.fecha_fin < self.fecha_inicio:
            raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio.")
        return self

class PacienteCuidadorUpdate(BaseModel):
    permiso_registro: bool | None = None
    permiso_lectura: bool | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    activo: bool | None = None

    @field_validator("fecha_fin")
    @classmethod
    def _val_fecha_fin(cls, v, values):
        fi = values.get("fecha_inicio")
        if fi and v and v < fi:
            raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio.")
        return v

class PacienteCuidadorOut(BaseModel):
    rut_paciente: str
    rut_cuidador: str
    permiso_registro: bool
    permiso_lectura: bool
    fecha_inicio: datetime
    fecha_fin: datetime
    activo: bool

    class Config:
        from_attributes = True

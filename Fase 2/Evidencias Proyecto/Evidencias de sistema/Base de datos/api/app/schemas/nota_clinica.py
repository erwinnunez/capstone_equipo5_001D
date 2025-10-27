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

class NotaClinicaCreate(BaseModel):
    rut_paciente: str = Field(..., example="12345678K")
    rut_medico: str = Field(..., example="12345678K")
    tipo_autor: str = Field(..., min_length=3, max_length=50)
    nota: str = Field(..., min_length=3, max_length=500)
    tipo_nota: str = Field(..., min_length=3, max_length=50)
    creada_en: datetime

    @field_validator("rut_paciente", "rut_medico")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @model_validator(mode="after")
    def _ruts_distintos(self):
        if self.rut_paciente == self.rut_medico:
            raise ValueError("El RUT del paciente y el del medico no pueden ser iguales.")
        return self

    @field_validator("tipo_autor", "nota", "tipo_nota")
    @classmethod
    def _clean_txt(cls, v: str):
        return v.strip().capitalize() if v else v

class NotaClinicaUpdate(BaseModel):
    tipo_autor: str | None = Field(None, min_length=3, max_length=50)
    nota: str | None = Field(None, min_length=3, max_length=500)
    tipo_nota: str | None = Field(None, min_length=3, max_length=50)
    creada_en: datetime | None = None

    @field_validator("tipo_autor", "nota", "tipo_nota")
    @classmethod
    def _clean_txt_upd(cls, v: str | None):
        return v.strip().capitalize() if v else v

class NotaClinicaOut(BaseModel):
    id_nota: int
    rut_paciente: str
    rut_medico: str
    tipo_autor: str
    nota: str
    tipo_nota: str
    creada_en: datetime

    class Config:
        from_attributes = True

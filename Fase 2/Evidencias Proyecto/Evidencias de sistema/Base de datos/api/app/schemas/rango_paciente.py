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

class RangoPacienteCreate(BaseModel):
    rut_paciente: str = Field(..., example="12345678K")
    id_parametro: int = Field(..., ge=1)
    min_normal: int
    max_normal: int
    min_critico: int
    max_critico: int
    vigencia_desde: datetime
    vigencia_hasta: datetime
    version: int = Field(..., ge=1)
    definido_por: bool

    @field_validator("rut_paciente")
    @classmethod
    def _val_rut(cls, v: str) -> str:
        return _validate_rut_plain(v)

    @field_validator("min_normal", "max_normal", "min_critico", "max_critico")
    @classmethod
    def _val_rangos_no_neg(cls, v: int) -> int:
        if not isinstance(v, int):
            raise ValueError("Los rangos deben ser números enteros.")
        if v < 0:
            raise ValueError("El rango no puede ser negativo.")
        return v

    @model_validator(mode="before")
    @classmethod
    def _val_rangos(cls, values):
        mn = values.get("min_normal")
        mx = values.get("max_normal")
        mc = values.get("min_critico")
        xc = values.get("max_critico")
        if mn is not None and mx is not None and mn > mx:
            raise ValueError("min_normal no puede ser mayor a max_normal.")
        if mc is not None and xc is not None and mc > xc:
            raise ValueError("min_critico no puede ser mayor a max_critico.")
        return values

    @model_validator(mode="after")
    def _val_vigencia(self):
        if self.vigencia_hasta < self.vigencia_desde:
            raise ValueError("vigencia_hasta no puede ser anterior a vigencia_desde.")
        return self

class RangoPacienteUpdate(BaseModel):
    min_normal: int | None = None
    max_normal: int | None = None
    min_critico: int | None = None
    max_critico: int | None = None
    vigencia_desde: datetime | None = None
    vigencia_hasta: datetime | None = None
    version: int | None = None
    definido_por: bool | None = None

    @model_validator(mode="before")
    @classmethod
    def _val_rangos_upd(cls, values):
        mn = values.get("min_normal")
        mx = values.get("max_normal")
        mc = values.get("min_critico")
        xc = values.get("max_critico")
        if mn is not None and mx is not None and mn > mx:
            raise ValueError("min_normal no puede ser mayor a max_normal.")
        if mc is not None and xc is not None and mc > xc:
            raise ValueError("min_critico no puede ser mayor a max_critico.")
        return values

    @model_validator(mode="after")
    def _val_vigencia_upd(self):
        if self.vigencia_desde and self.vigencia_hasta and self.vigencia_hasta < self.vigencia_desde:
            raise ValueError("vigencia_hasta no puede ser anterior a vigencia_desde.")
        return self

class RangoPacienteOut(BaseModel):
    id_rango: int
    rut_paciente: str
    id_parametro: int
    min_normal: int
    max_normal: int
    min_critico: int
    max_critico: int
    vigencia_desde: datetime
    vigencia_hasta: datetime
    version: int
    definido_por: bool

    class Config:
        from_attributes = True

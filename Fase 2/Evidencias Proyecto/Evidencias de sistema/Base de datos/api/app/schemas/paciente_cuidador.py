from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime

class PacienteCuidadorCreate(BaseModel):
    rut_paciente: int = Field(..., example="212511374")
    rut_cuidador: int = Field(..., example="212511374")
    permiso_registro: bool
    permiso_lectura: bool
    fecha_inicio: datetime
    fecha_fin: datetime
    activo: bool

    # --- VALIDAR RUT ---
    @field_validator("rut_paciente", "rut_cuidador")
    @classmethod
    def validar_rut(cls, v, field):
        numero = str(v)
        if not numero.isdigit():
            raise ValueError(f"El {field.name} solo debe contener números (sin puntos ni guion).")
        if len(numero) != 9:
            raise ValueError(f"El {field.name} debe tener exactamente 9 dígitos.")
        return v
    
    @model_validator(mode="after")
    def validar_ruts_diferentes(self):
        if self.rut_paciente == self.rut_cuidador:
            raise ValueError("El RUT del paciente y el del cuidador no pueden ser iguales.")
        return self

    # --- VALIDAR FECHAS ---
    @model_validator(mode="after")
    def validar_fechas(self):
        if self.fecha_fin and self.fecha_fin < self.fecha_inicio:
            raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio.")
        return self


class PacienteCuidadorUpdate(BaseModel):
    permiso_registro: bool | None = None
    permiso_lectura: bool | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    activo: bool | None = None

# --- VALIDAR FECHAS ---
    @field_validator("fecha_fin")
    @classmethod
    def validar_fecha_fin_update(cls, v, values):
        fecha_inicio = values.get("fecha_inicio")
        if fecha_inicio and v and v < fecha_inicio:
            raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio.")
        return v

class PacienteCuidadorOut(BaseModel):
    rut_paciente: int
    rut_cuidador: int
    permiso_registro: bool
    permiso_lectura: bool
    fecha_inicio: datetime
    fecha_fin: datetime
    activo: bool
    class Config:
        from_attributes = True

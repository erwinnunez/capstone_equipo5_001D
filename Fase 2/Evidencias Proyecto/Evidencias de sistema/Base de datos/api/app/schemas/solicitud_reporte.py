from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime

class SolicitudReporteCreate(BaseModel):
    rut_medico: int = Field(..., example="212511374")
    rut_paciente: int = Field(..., example="212511374")
    rango_desde: datetime
    rango_hasta: datetime
    tipo: str
    formato: str
    estado: str
    creado_en: datetime

# --- VALIDAR RUTs ---
    @field_validator("rut_medico", "rut_paciente")
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
        if self.rut_paciente == self.rut_medico:
            raise ValueError("El RUT del paciente y el del medico no pueden ser iguales.")
        return self

    # --- VALIDAR RANGO DE FECHAS ---
    @model_validator(mode="before")
    @classmethod
    def validar_rango(cls, values):
        desde = values.get("rango_desde")
        hasta = values.get("rango_hasta")
        if desde and hasta and hasta < desde:
            raise ValueError("rango_hasta no puede ser anterior a rango_desde.")
        return values

class SolicitudReporteUpdate(BaseModel):
    rut_medico: int | None = None
    rut_paciente: int | None = None
    rango_desde: datetime | None = None
    rango_hasta: datetime | None = None
    tipo: str | None = None
    formato: str | None = None
    estado: str | None = None
    creado_en: datetime | None = None

# --- VALIDAR RUTs ---
    @field_validator("rut_medico", "rut_paciente")
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
        if self.rut_paciente == self.rut_medico:
            raise ValueError("El RUT del paciente y el del medico no pueden ser iguales.")
        return self

    # --- VALIDAR RANGO DE FECHAS ---
    @model_validator(mode="before")
    @classmethod
    def validar_rango_update(cls, values):
        desde = values.get("rango_desde")
        hasta = values.get("rango_hasta")
        if desde and hasta and hasta < desde:
            raise ValueError("rango_hasta no puede ser anterior a rango_desde.")
        return values

class SolicitudReporteOut(BaseModel):
    id_reporte: int
    rut_medico: int
    rut_paciente: int
    rango_desde: datetime
    rango_hasta: datetime
    tipo: str
    formato: str
    estado: str
    creado_en: datetime
    class Config:
        from_attributes = True

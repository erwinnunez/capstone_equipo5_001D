from pydantic import BaseModel, Field, field_validator,model_validator
from datetime import datetime

class NotaClinicaCreate(BaseModel):
    rut_paciente: int = Field(..., example="212511374")
    rut_medico: int = Field(..., example="212511374")
    tipo_autor: str = Field(..., min_length=3, max_length=50)
    nota: str = Field(..., min_length=3, max_length=500)
    tipo_nota: str = Field(..., min_length=3, max_length=50)
    creada_en: datetime

# --- VALIDAR RUT ---
    @field_validator("rut_paciente", "rut_medico")
    @classmethod
    def validar_rut(cls, v):
        numero = str(v)
        if not numero.isdigit() or len(numero) > 9:
            raise ValueError("El RUT debe tener hasta 9 dígitos (incluyendo dígito verificador).")
        return v

    @model_validator(mode="after")
    def validar_ruts_diferentes(self):
        if self.rut_paciente == self.rut_medico:
            raise ValueError("El RUT del paciente y el del medico no pueden ser iguales.")
        return self

    # --- LIMPIAR TEXTO ---
    @field_validator("tipo_autor", "nota", "tipo_nota")
    @classmethod
    def limpiar_texto(cls, v):
        return v.strip().capitalize() if v else v


class NotaClinicaUpdate(BaseModel):
    tipo_autor: str | None = Field(None, min_length=3, max_length=50)
    nota: str | None = Field(None, min_length=3, max_length=500)
    tipo_nota: str | None = Field(None, min_length=3, max_length=50)
    creada_en: datetime | None = None

    # --- LIMPIAR TEXTO ---
    @field_validator("tipo_autor", "nota", "tipo_nota")
    @classmethod
    def limpiar_texto_update(cls, v):
        return v.strip().capitalize() if v else v

class NotaClinicaOut(BaseModel):
    id_nota: int
    rut_paciente: int
    rut_medico: int
    tipo_autor: str
    nota: str
    tipo_nota: str
    creada_en: datetime
    class Config:
        from_attributes = True

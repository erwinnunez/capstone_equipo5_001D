from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime

class RangoPacienteCreate(BaseModel):
    rut_paciente: int = Field(..., example="212511374")
    id_parametro: int = Field(..., ge=1)
    min_normal: int
    max_normal: int
    min_critico: int
    max_critico: int
    vigencia_desde: datetime
    vigencia_hasta: datetime
    version: int = Field(..., ge=1)
    definido_por: bool

    # --- VALIDAR RUT ---
    @field_validator("rut_paciente")
    @classmethod
    def validar_rut(cls, v, field):
        numero = str(v)
        if not numero.isdigit():
            raise ValueError(f"El {field.name} solo debe contener números (sin puntos ni guion).")
        if len(numero) not in (8,9): #cambiar valor a 9 despues
            raise ValueError(f"El {field.name} debe tener exactamente 9 dígitos.")
        return v

    # --- VALIDAR RANGOS ---
    @field_validator("min_normal", "max_normal", "min_critico", "max_critico")
    @classmethod
    def validar_rangos_negativo(cls, v):
        if not isinstance(v, int):
            raise ValueError("Los rangos deben ser números enteros.")
        if v < 0:
            raise ValueError("El rango no puede ser negativo.")       
        return v

    # --- VALIDACIÓN CRUZADA DE RANGOS ---
    @model_validator(mode="before")
    @classmethod
    def validar_rangos(cls, values):
        min_normal = values.get("min_normal")
        max_normal = values.get("max_normal")
        min_critico = values.get("min_critico")
        max_critico = values.get("max_critico")

        if min_normal is not None and max_normal is not None:
            if min_normal > max_normal:
                raise ValueError("min_normal no puede ser mayor a max_normal.")
        if min_critico is not None and max_critico is not None:
            if min_critico > max_critico:
                raise ValueError("min_critico no puede ser mayor a max_critico.")
        return values


    # --- VALIDAR VIGENCIA ---
    @model_validator(mode="after")
    def validar_vigencia(cls, values):
        if values.vigencia_hasta < values.vigencia_desde:
            raise ValueError("vigencia_hasta no puede ser anterior a vigencia_desde.")
        return values



class RangoPacienteUpdate(BaseModel):
    min_normal: int | None = None
    max_normal: int | None = None
    min_critico: int | None = None
    max_critico: int | None = None
    vigencia_desde: datetime | None = None
    vigencia_hasta: datetime | None = None
    version: int | None = None
    definido_por: bool | None = None

    # --- VALIDACIÓN CRUZADA DE RANGOS ---
    @model_validator(mode="before")
    @classmethod
    def validar_rangos_update(cls, values):
        min_normal = values.get("min_normal")
        max_normal = values.get("max_normal")
        min_critico = values.get("min_critico")
        max_critico = values.get("max_critico")

        if min_normal is not None and max_normal is not None:
            if min_normal > max_normal:
                raise ValueError("min_normal no puede ser mayor a max_normal.")
        if min_critico is not None and max_critico is not None:
            if min_critico > max_critico:
                raise ValueError("min_critico no puede ser mayor a max_critico.")
        return values
    
    # --- VALIDAR VIGENCIA ---
    @model_validator(mode="after")
    def validar_vigencia(cls, values):
        desde = values.vigencia_desde
        hasta = values.vigencia_hasta

        if desde and hasta and hasta < desde:
            raise ValueError("vigencia_hasta no puede ser anterior a vigencia_desde.")

        for campo in ["min_normal", "max_normal", "min_critico", "max_critico"]:
            valor = getattr(values, campo, None)
            if valor is not None and valor < 0:
                raise ValueError(f"{campo} no puede ser negativo.")
            return values
        

class RangoPacienteOut(BaseModel):
    id_rango: int
    rut_paciente: int
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

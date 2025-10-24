from pydantic import BaseModel, Field, field_validator, model_validator

class ParametroClinicoCreate(BaseModel):
    id_unidad: int = Field(..., ge=1)
    codigo: str = Field(..., min_length=1, max_length=50)
    descipcion: str = Field(..., min_length=3, max_length=255)
    rango_ref_min: int
    rango_ref_max: int
    unidad_codigo: str | None = None
    unidad_nombre: str | None = None

    # --- VALIDAR RANGOS ---
    @field_validator("rango_ref_min", "rango_ref_max")
    @classmethod
    def validar_rango_no_negativo(cls, v):
        if v is not None:
            if not isinstance(v, int):
                raise ValueError("El rango debe ser un número entero.")
            if v < 0:
                raise ValueError("El rango no puede ser negativo.")
        return v
    
    @model_validator(mode="after")
    def validar_relacion_rangos(cls, values):
        """Valida que el rango máximo no sea menor que el mínimo."""
        rango_min = values.rango_ref_min
        rango_max = values.rango_ref_max
        if rango_min is not None and rango_max is not None and rango_max < rango_min:
            raise ValueError("El rango máximo no puede ser menor que el mínimo.")
        return values
    
    # --- LIMPIAR TEXTO ---
    @field_validator("codigo", "descipcion", "unidad_codigo", "unidad_nombre")
    @classmethod
    def limpiar_texto(cls, v):
        return v.strip().capitalize() if v else v

class ParametroClinicoUpdate(BaseModel):
    id_unidad: int | None = Field(None, ge=1)
    codigo: str | None = Field(None, min_length=1, max_length=50)
    descipcion: str | None = Field(None, min_length=3, max_length=255)
    rango_ref_min: int | None = None
    rango_ref_max: int | None = None

    # --- VALIDAR RANGOS ---
    @field_validator("rango_ref_min", "rango_ref_max")
    @classmethod
    def validar_rango_no_negativo(cls, v):
        if v is not None:
            if not isinstance(v, int):
                raise ValueError("El rango debe ser un número entero.")
            if v < 0:
                raise ValueError("El rango no puede ser negativo.")
        return v
    
    @model_validator(mode="after")
    def validar_relacion_rangos(cls, values):
        """Valida que el rango máximo no sea menor que el mínimo."""
        rango_min = values.rango_ref_min
        rango_max = values.rango_ref_max
        if rango_min is not None and rango_max is not None and rango_max < rango_min:
            raise ValueError("El rango máximo no puede ser menor que el mínimo.")
        return values

    # --- LIMPIAR TEXTO ---
    @field_validator("codigo", "descipcion")
    @classmethod
    def limpiar_texto_update(cls, v):
        return v.strip().capitalize() if v else v

class ParametroClinicoOut(BaseModel):
    id_parametro: int
    id_unidad: int
    codigo: str
    descipcion: str
    rango_ref_min: int
    rango_ref_max: int
    unidad_codigo: str | None = None
    unidad_nombre: str | None = None
    class Config:
        from_attributes = True

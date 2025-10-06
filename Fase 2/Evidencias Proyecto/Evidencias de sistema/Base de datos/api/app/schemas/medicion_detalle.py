from pydantic import BaseModel, Field, field_validator, ValidationInfo

class MedicionDetalleCreate(BaseModel):
    id_medicion: int = Field(..., ge=1, description="ID de la medición asociada")
    id_parametro: int = Field(..., ge=1, description="ID del parámetro medido")
    id_unidad: int = Field(..., ge=1, description="ID de la unidad de medida")
    valor_num: float = Field(..., description="Valor numérico registrado")
    valor_texto: str = Field(..., min_length=1, max_length=255, description="Valor en texto asociado")
    fuera_rango: bool
    severidad: str = Field(..., min_length=1, max_length=255, description="Nivel de severidad")
    umbral_min: float = Field(..., description="Valor mínimo permitido")
    umbral_max: float = Field(..., description="Valor máximo permitido")
    tipo_alerta: str = Field(..., min_length=1, max_length=255, description="Tipo de alerta")

    @field_validator("umbral_max")
    @classmethod
    def validar_rangos(cls, v,  info: ValidationInfo):
        umbral_min = info.data.get("umbral_min")
        if umbral_min is not None and v < umbral_min:
            raise ValueError("umbral_max no puede ser menor que umbral_min")
        return v

    @field_validator("fuera_rango", mode="before")
    @classmethod
    def calcular_fuera_rango(cls, v, info: ValidationInfo):
        data = info.data  # ✅ acceso correcto a los valores del modelo

        valor = data.get("valor_num")
        umbral_min = data.get("umbral_min")
        umbral_max = data.get("umbral_max")

        if valor is not None and umbral_min is not None and umbral_max is not None:
            return not (umbral_min <= valor <= umbral_max)
        return v
    
    @field_validator("valor_texto")
    @classmethod
    def limpiar_texto(cls, v):
        return v.strip().capitalize()

class MedicionDetalleUpdate(BaseModel):
    id_parametro: int | None = Field(None, ge=1)
    id_unidad: int | None = Field(None, ge=1)
    valor_num: float | None = None
    valor_texto: str | None = None
    fuera_rango: bool | None = None
    severidad: str | None = Field(None, min_length=1, max_length=255)
    umbral_min: float | None = None
    umbral_max: float | None = None
    tipo_alerta: str | None = Field(None, min_length=1, max_length=255)

    @field_validator("umbral_max")
    @classmethod
    def validar_rangos_update(cls, v, info: ValidationInfo):
        umbral_min = info.data.get("umbral_min")
        if umbral_min is not None and v is not None and v < umbral_min:
            raise ValueError("umbral_max no puede ser menor que umbral_min")
        return v

    @field_validator("fuera_rango", mode="before")
    @classmethod
    def recalcular_fuera_rango(cls, v, info: ValidationInfo):
        valor = info.data.get("valor_num")
        umbral_min = info.data.get("umbral_min")
        umbral_max = info.data.get("umbral_max")
        if valor is not None and umbral_min is not None and umbral_max is not None:
            return not (umbral_min <= valor <= umbral_max)
        return v

    @field_validator("valor_texto")
    @classmethod
    def limpiar_texto_update(cls, v):
        return v.strip().capitalize() if v else v

class MedicionDetalleOut(BaseModel):
    id_detalle: int
    id_medicion: int
    id_parametro: int
    id_unidad: int
    valor_num: float
    valor_texto: str
    fuera_rango: bool
    severidad: str
    umbral_min: float
    umbral_max: float
    tipo_alerta: str
    class Config:
        from_attributes = True

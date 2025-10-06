from pydantic import BaseModel, Field, field_validator

class UnidadMedidaCreate(BaseModel):
    codigo: str = Field(..., min_length=1, max_length=50)
    descipcion: str = Field(..., min_length=3, max_length=255)

# --- LIMPIAR TEXTO ---
    @field_validator("codigo", "descipcion")
    @classmethod
    def limpiar_texto(cls, v):
        return v.strip().capitalize() if v else v

class UnidadMedidaUpdate(BaseModel):
    codigo: str | None = Field(None, min_length=1, max_length=50)
    descipcion: str | None = Field(None, min_length=3, max_length=255)

# --- LIMPIAR TEXTO ---
    @field_validator("codigo", "descipcion")
    @classmethod
    def limpiar_texto_update(cls, v):
        return v.strip().capitalize() if v else v

class UnidadMedidaOut(BaseModel):
    id_unidad: int
    codigo: str
    descipcion: str
    class Config:
        from_attributes = True

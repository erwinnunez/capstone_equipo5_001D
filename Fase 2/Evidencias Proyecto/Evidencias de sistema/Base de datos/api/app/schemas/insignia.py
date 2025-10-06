from pydantic import BaseModel, Field, field_validator

class InsigniaCreate(BaseModel):
    codigo: int = Field(..., ge=1, description="Código único y positivo de la insignia", example=101)
    nombre_insignia: str = Field(..., min_length=3, max_length=100, description="Nombre de la insignia", example="Constancia")
    descipcion: str = Field(..., min_length=5, max_length=255, description="Descripción breve de la insignia", example="Otorgada por completar 7 días consecutivos de actividad")

    @field_validator("nombre_insignia", "descipcion")
    @classmethod
    def limpiar_espacios(cls, v):
        return v.strip()
    
    @field_validator("nombre_insignia", "descipcion")
    @classmethod
    def validar_nombres(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("solo pueden contener letras y espacios")
        return v.strip().title()
    
class InsigniaUpdate(BaseModel):
    codigo: int | None = Field(None, ge=1, description="Código único y positivo de la insignia")
    nombre_insignia: str | None  = Field(None, min_length=3, max_length=100, description="Nombre de la insignia")
    descipcion: str | None = Field(None, min_length=5, max_length=255, description="Descripción breve de la insignia")

    @field_validator("nombre_insignia", "descipcion")
    @classmethod
    def limpiar_espacios(cls, v):
        return v.strip() if v else v

    @field_validator("nombre_insignia", "descipcion")
    @classmethod
    def validar_nombres(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("solo pueden contener letras y espacios")
        return v.strip().title()

class InsigniaOut(BaseModel):
    id_insignia: int
    codigo: int
    nombre_insignia: str
    descipcion: str
    class Config:
        from_attributes = True

from pydantic import BaseModel, Field,field_validator

class ComunaCreate(BaseModel):
    id_region: int
    nombre_comuna: str = Field(..., min_length=4, max_length=100, example="Viña del mar")

    @field_validator("nombre_comuna")
    @classmethod
    def validar_nombre_comuna(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("El nombre de la comuna solo puede contener letras y espacios")
        return v.title() 


class ComunaUpdate(BaseModel):
    id_region: int | None = None
    nombre_comuna: str | None = Field(..., min_length=4, max_length=100, example="Hualpen")

    @field_validator("nombre_comuna")
    @classmethod
    def validar_nombre_comuna(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("El nombre de la comuna solo puede contener letras y espacios")
        return v.title() 

class ComunaOut(BaseModel):
    id_comuna: int
    id_region: int
    nombre_comuna: str
    class Config:
        from_attributes = True

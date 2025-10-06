from pydantic import BaseModel,Field,field_validator

class RegionCreate(BaseModel):
    nombre_region: str  = Field(..., min_length=3, max_length=100, example="Región Metropolitana")

    @field_validator("nombre_region")
    @classmethod
    def validar_nombre_region(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("El nombre de la región solo puede contener letras y espacios")
        return v.title()  # convierte a formato tipo "Región Metropolitana"


class RegionUpdate(BaseModel):
    nombre_region: str | None = Field(None, min_length=3, max_length=100, example="Región Metropolitana")

    @field_validator("nombre_region")
    @classmethod
    def validar_nombre_region(cls, v):
        if v and not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("El nombre de la región solo puede contener letras y espacios")
        return v.title() if v else v

class RegionOut(BaseModel):
    id_region: int
    nombre_region: str

    class Config:
        from_attributes = True



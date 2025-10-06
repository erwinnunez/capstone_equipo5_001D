from pydantic import BaseModel, Field, field_validator

class MedicinaCreate(BaseModel):
    id_unidad: int = Field(..., ge=1, description="ID de la unidad de medida asociada")
    nombre: str = Field(..., min_length=3, max_length=100, example="Paracetamol")
    instrucciones: str = Field(..., min_length=5, max_length=255, example="Tomar con agua después de las comidas")
    toma_maxima: str = Field(..., min_length=3, max_length=50, example="3 veces al día")
    efectos: str = Field(..., min_length=5, max_length=255, example="Puede causar somnolencia o malestar estomacal")

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v):
        """Permitir solo letras, espacios y guiones."""
        if not all(c.isalpha() or c.isspace() or c in "-()" for c in v):
            raise ValueError("El nombre solo puede contener letras, espacios o guiones")
        return v.strip().title()

    @field_validator("instrucciones", "toma_maxima", "efectos")
    @classmethod
    def limpiar_texto(cls, v):
        """Quita espacios innecesarios y normaliza mayúsculas."""
        return v.strip().capitalize()


class MedicinaUpdate(BaseModel):
    id_unidad: int | None = Field(None, ge=1)
    nombre: str | None = Field(None, min_length=3, max_length=100)
    instrucciones: str | None = Field(None, min_length=5, max_length=255)
    toma_maxima: str | None = Field(None, min_length=3, max_length=50)
    efectos: str | None = Field(None, min_length=5, max_length=255)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v):
        if v and not all(c.isalpha() or c.isspace() or c in "-()" for c in v):
            raise ValueError("El nombre solo puede contener letras, espacios o guiones")
        return v.strip().title() if v else v

    @field_validator("instrucciones", "toma_maxima", "efectos")
    @classmethod
    def limpiar_texto(cls, v):
        return v.strip().capitalize() if v else v

class MedicinaOut(BaseModel):
    id_medicina: int
    id_unidad: int
    nombre: str
    instrucciones: str
    toma_maxima: str
    efectos: str
    class Config:
        from_attributes = True

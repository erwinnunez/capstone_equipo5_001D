from pydantic import BaseModel

class MedicinaCreate(BaseModel):
    id_unidad: int
    nombre: str
    instrucciones: str
    toma_maxima: str
    efectos: str

class MedicinaUpdate(BaseModel):
    id_unidad: int | None = None
    nombre: str | None = None
    instrucciones: str | None = None
    toma_maxima: str | None = None
    efectos: str | None = None

class MedicinaOut(BaseModel):
    id_medicina: int
    id_unidad: int
    nombre: str
    instrucciones: str
    toma_maxima: str
    efectos: str
    class Config:
        from_attributes = True

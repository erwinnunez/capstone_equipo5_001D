from pydantic import BaseModel

class UnidadMedidaCreate(BaseModel):
    nombre_unidad: str
    simbolo: str | None = None

class UnidadMedidaUpdate(BaseModel):
    nombre_unidad: str | None = None
    simbolo: str | None = None

class UnidadMedidaOut(BaseModel):
    id_unidad: int
    nombre_unidad: str
    simbolo: str | None = None
    class Config:
        from_attributes = True

from pydantic import BaseModel

class UnidadMedidaCreate(BaseModel):
    codigo: str
    descipcion: str

class UnidadMedidaUpdate(BaseModel):
    codigo: str | None = None
    descipcion: str | None = None

class UnidadMedidaOut(BaseModel):
    id_unidad: int
    codigo: str
    descipcion: str
    class Config:
        from_attributes = True

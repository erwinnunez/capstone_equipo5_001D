from pydantic import BaseModel

class UnidadMedidaBase(BaseModel):
    codigo: str
    descripcion: str

class UnidadMedidaCreate(UnidadMedidaBase):
    pass

class UnidadMedidaRead(UnidadMedidaBase):
    id_unidad: int

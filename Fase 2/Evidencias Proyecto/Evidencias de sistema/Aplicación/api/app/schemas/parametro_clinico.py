from pydantic import BaseModel

class ParametroClinicoCreate(BaseModel):
    nombre_parametro: str
    id_unidad: int

class ParametroClinicoUpdate(BaseModel):
    nombre_parametro: str | None = None
    id_unidad: int | None = None

class ParametroClinicoOut(BaseModel):
    id_parametro: int
    nombre_parametro: str
    id_unidad: int
    class Config:
        from_attributes = True

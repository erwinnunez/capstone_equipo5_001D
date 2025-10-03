from pydantic import BaseModel

class ParametroClinicoCreate(BaseModel):
    id_unidad: int
    codigo: str
    descipcion: str
    rango_ref_min: int
    rango_ref_max: int

class ParametroClinicoUpdate(BaseModel):
    id_unidad: int | None = None
    codigo: str | None = None
    descipcion: str | None = None
    rango_ref_min: int | None = None
    rango_ref_max: int | None = None

class ParametroClinicoOut(BaseModel):
    id_parametro: int
    id_unidad: int
    codigo: str
    descipcion: str
    rango_ref_min: int
    rango_ref_max: int
    class Config:
        from_attributes = True

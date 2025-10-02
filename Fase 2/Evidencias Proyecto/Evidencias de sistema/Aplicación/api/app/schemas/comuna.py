from pydantic import BaseModel

class ComunaCreate(BaseModel):
    id_region: int
    nombre_comuna: str

class ComunaUpdate(BaseModel):
    id_region: int | None = None
    nombre_comuna: str | None = None

class ComunaOut(BaseModel):
    id_comuna: int
    id_region: int
    nombre_comuna: str
    class Config:
        from_attributes = True

from pydantic import BaseModel

class InsigniaCreate(BaseModel):
    nombre_insignia: str
    descripcion: str | None = None

class InsigniaUpdate(BaseModel):
    nombre_insignia: str | None = None
    descripcion: str | None = None

class InsigniaOut(BaseModel):
    id_insignia: int
    codigo: str
    nombre_insignia: str
    descripcion: str | None = None
    class Config:
        from_attributes = True

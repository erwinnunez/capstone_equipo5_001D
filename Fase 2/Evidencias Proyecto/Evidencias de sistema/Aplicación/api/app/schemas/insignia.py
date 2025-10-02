from pydantic import BaseModel

class InsigniaCreate(BaseModel):
    codigo: int
    nombre_insignia: str
    descipcion: str

class InsigniaUpdate(BaseModel):
    codigo: int | None = None
    nombre_insignia: str | None = None
    descipcion: str | None = None

class InsigniaOut(BaseModel):
    id_insignia: int
    codigo: int
    nombre_insignia: str
    descipcion: str
    class Config:
        from_attributes = True

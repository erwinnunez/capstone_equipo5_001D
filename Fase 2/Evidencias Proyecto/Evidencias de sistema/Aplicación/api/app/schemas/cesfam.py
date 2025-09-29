from pydantic import BaseModel

class CesfamCreate(BaseModel):
    id_cesfam: int
    id_comuna: int
    nombre_cesfam: str
    telefono: str | None = None
    direccion: str | None = None
    email: str | None = None

class CesfamUpdate(BaseModel):
    id_comuna: int | None = None
    nombre_cesfam: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    email: str | None = None

class CesfamOut(BaseModel):
    id_cesfam: int
    id_comuna: int
    nombre_cesfam: str
    telefono: str | None = None
    direccion: str | None = None
    email: str | None = None
    class Config:
        from_attributes = True

from pydantic import BaseModel

# -------- Create / Update / Out --------
class CesfamCreate(BaseModel):
    id_comuna: int
    nombre_cesfam: str
    telefono: int
    direccion: str
    email: str
    estado: bool

class CesfamUpdate(BaseModel):
    id_comuna: int | None = None
    nombre_cesfam: str | None = None
    telefono: int | None = None
    direccion: str | None = None
    email: str | None = None
    estado: bool | None = None

class CesfamOut(BaseModel):
    id_cesfam: int
    id_comuna: int
    nombre_cesfam: str
    telefono: int
    direccion: str
    email: str
    estado: bool
    class Config:
        from_attributes = True

# -------- List filters (paginación) --------
class CesfamListFilters(BaseModel):
    page: int = 1
    page_size: int = 20
    id_comuna: int | None = None
    estado: bool | None = True  # por defecto, solo activos

# -------- Habilitar / Deshabilitar --------
class CesfamSetEstado(BaseModel):
    habilitar: bool

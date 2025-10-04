from pydantic import BaseModel

class RegionCreate(BaseModel):
    nombre_region: str

class RegionUpdate(BaseModel):
    nombre_region: str | None = None

class RegionOut(BaseModel):
    id_region: int
    nombre_region: str
    class Config:
        from_attributes = True

from pydantic import BaseModel

class MedicionDetalleCreate(BaseModel):
    id_medicion: int
    id_parametro: int
    id_unidad: int
    valor_num: int
    valor_texto: str
    fuera_rango: bool
    severidad: str
    umbral_min: int
    umbral_max: int
    tipo_alerta: str

class MedicionDetalleUpdate(BaseModel):
    id_parametro: int | None = None
    id_unidad: int | None = None
    valor_num: int | None = None
    valor_texto: str | None = None
    fuera_rango: bool | None = None
    severidad: str | None = None
    umbral_min: int | None = None
    umbral_max: int | None = None
    tipo_alerta: str | None = None

class MedicionDetalleOut(BaseModel):
    id_detalle: int
    id_medicion: int
    id_parametro: int
    id_unidad: int
    valor_num: int
    valor_texto: str
    fuera_rango: bool
    severidad: str
    umbral_min: int
    umbral_max: int
    tipo_alerta: str
    class Config:
        from_attributes = True

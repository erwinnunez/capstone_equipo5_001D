from pydantic import BaseModel
from datetime import datetime

class MedicionCreate(BaseModel):
    rut_paciente: int
    fecha_registro: datetime
    origen: str
    registrado_por: str
    observacion: str
    evaluada_en: datetime
    tiene_alerta: bool
    severidad_max: str
    resumen_alerta: str

class MedicionUpdate(BaseModel):
    fecha_registro: datetime | None = None
    origen: str | None = None
    registrado_por: str | None = None
    observacion: str | None = None
    evaluada_en: datetime | None = None
    tiene_alerta: bool | None = None
    severidad_max: str | None = None
    resumen_alerta: str | None = None

class MedicionOut(BaseModel):
    id_medicion: int
    rut_paciente: int
    fecha_registro: datetime
    origen: str
    registrado_por: str
    observacion: str
    evaluada_en: datetime
    tiene_alerta: bool
    severidad_max: str
    resumen_alerta: str
    class Config:
        from_attributes = True

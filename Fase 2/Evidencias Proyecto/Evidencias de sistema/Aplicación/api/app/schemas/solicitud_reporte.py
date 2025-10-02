from pydantic import BaseModel
from datetime import datetime

class SolicitudReporteCreate(BaseModel):
    rut_medico: int
    rut_paciente: int
    rango_desde: datetime
    rango_hasta: datetime
    tipo: str
    formato: str
    estado: str
    creado_en: datetime

class SolicitudReporteUpdate(BaseModel):
    rut_medico: int | None = None
    rut_paciente: int | None = None
    rango_desde: datetime | None = None
    rango_hasta: datetime | None = None
    tipo: str | None = None
    formato: str | None = None
    estado: str | None = None
    creado_en: datetime | None = None

class SolicitudReporteOut(BaseModel):
    id_reporte: int
    rut_medico: int
    rut_paciente: int
    rango_desde: datetime
    rango_hasta: datetime
    tipo: str
    formato: str
    estado: str
    creado_en: datetime
    class Config:
        from_attributes = True

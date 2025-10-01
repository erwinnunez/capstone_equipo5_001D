from pydantic import BaseModel
from datetime import datetime

class SolicitudReporteCreate(BaseModel):
    rut_medico: int
    rut_paciente: int
    estado: str = "pendiente"
    creado_en: datetime | None = None
    observacion: str | None = None

class SolicitudReporteUpdate(BaseModel):
    estado: str | None = None
    observacion: str | None = None

class SolicitudReporteOut(BaseModel):
    id_reporte: int
    rut_medico: int
    rut_paciente: int
    estado: str
    creado_en: datetime
    observacion: str | None = None
    class Config:
        from_attributes = True

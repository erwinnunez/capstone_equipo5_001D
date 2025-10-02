from pydantic import BaseModel
from datetime import datetime

class DescargaReporteCreate(BaseModel):
    rut_medico: int
    id_reporte: int
    descargado_en: datetime

class DescargaReporteOut(BaseModel):
    id_descarga: int
    rut_medico: int
    id_reporte: int
    descargado_en: datetime
    class Config:
        from_attributes = True

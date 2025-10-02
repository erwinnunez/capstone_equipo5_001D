from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotaClinicaCreate(BaseModel):
    rut_paciente: int
    rut_medico: int
    id_cesfam: int
    observacion: Optional[str] = None
    evidencia_bin: Optional[str] = None
    evidencia_url: Optional[str] = None
    severidad_max: Optional[int] = None
    resumen_alerta: Optional[str] = None

class NotaClinicaUpdate(BaseModel):
    id_cesfam: Optional[int] = None
    observacion: Optional[str] = None
    evidencia_bin: Optional[str] = None
    evidencia_url: Optional[str] = None
    severidad_max: Optional[int] = None
    resumen_alerta: Optional[str] = None

class NotaClinicaOut(BaseModel):
    id_nota: int
    rut_paciente: int
    rut_medico: int
    id_cesfam: int
    fecha_registro: datetime
    observacion: Optional[str] = None
    evidencia_bin: Optional[str] = None
    evidencia_url: Optional[str] = None
    severidad_max: Optional[int] = None
    resumen_alerta: Optional[str] = None
    class Config:
        from_attributes = True

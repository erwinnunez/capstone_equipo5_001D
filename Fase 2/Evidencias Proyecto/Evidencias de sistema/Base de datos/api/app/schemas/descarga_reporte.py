from pydantic import BaseModel, Field, field_validator
from datetime import datetime,timezone

class DescargaReporteCreate(BaseModel):
    rut_medico: int = Field(..., description="RUT del médico que descarga el reporte")
    id_reporte: int  = Field(..., gt=0, description="ID del reporte descargado")
    descargado_en: datetime = Field( description="Fecha y hora en que se descargó el reporte")

    # --- VALIDAR RUT ---
    @field_validator("rut_medico")
    @classmethod
    def validar_rut(cls, v, field):
        numero = str(v)
        if not numero.isdigit():
            raise ValueError(f"El {field.name} solo debe contener números (sin puntos ni guion).")
        if len(numero) != 9:
            raise ValueError(f"El {field.name} debe tener exactamente 9 dígitos.")
        return v

    # Validar que la fecha de descarga no sea futura
    @field_validator("descargado_en")
    @classmethod
    def validar_fecha_cambio(cls, v: datetime):
        now = datetime.now(timezone.utc)
        # Si la fecha viene sin tzinfo, la asumimos como UTC para evitar el error
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v > now:
            raise ValueError("La fecha de cambio no puede ser futura.")
        return v

class DescargaReporteOut(BaseModel):
    id_descarga: int
    rut_medico: int
    id_reporte: int
    descargado_en: datetime
    class Config:
        from_attributes = True

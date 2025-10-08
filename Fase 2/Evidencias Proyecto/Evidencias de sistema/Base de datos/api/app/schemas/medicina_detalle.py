from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone

class MedicinaDetalleCreate(BaseModel):
    id_medicina: int = Field(..., ge=1, description="ID de la medicina registrada")
    rut_paciente: int = Field(..., ge=1, description="RUT del paciente asociado")
    dosis: str = Field(..., min_length=1, max_length=100, example="1 tableta cada 8 horas")
    instrucciones_toma: str | None = Field(
        default=None,
        min_length=5,
        max_length=255,
        example="Tomar después de las comidas con agua"
    )
    fecha_inicio: datetime = Field(..., description="Fecha y hora de inicio del tratamiento")
    fecha_fin: datetime = Field(..., description="Fecha y hora de finalización del tratamiento")

    # Estado + NUEVO timestamp
    tomada: bool = Field(..., description="Indica si el paciente ya tomó la dosis")
    fecha_tomada: datetime | None = Field(
        default=None,
        description="Fecha/hora en que se tomó la dosis (UTC). Si tomada=True y no se envía, el backend la completará."
    )

    @field_validator("fecha_fin")
    @classmethod
    def validar_fechas(cls, v, info):
        fecha_inicio = info.data.get("fecha_inicio")
        if fecha_inicio:
            if fecha_inicio.tzinfo is None:
                fecha_inicio = fecha_inicio.replace(tzinfo=timezone.utc)
            if v.tzinfo is None:
                v = v.replace(tzinfo=timezone.utc)
            if v <= fecha_inicio:
                raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio")
        return v

    @field_validator("dosis", "instrucciones_toma")
    @classmethod
    def limpiar_texto(cls, v):
        if v is None:
            return v
        return v.strip().capitalize()


class MedicinaDetalleUpdate(BaseModel):
    id_medicina: int | None = Field(None, ge=1)
    rut_paciente: int | None = Field(None, ge=1)
    dosis: str | None = Field(None, min_length=1, max_length=50)
    instrucciones_toma: str | None = Field(None, min_length=5, max_length=255)
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None

    # Estado + (opcional) fecha_tomada, aunque el backend la seteará automáticamente
    tomada: bool | None = None
    fecha_tomada: datetime | None = None

    @field_validator("fecha_fin")
    @classmethod
    def validar_fechas(cls, v, values):
        fecha_inicio = values.get("fecha_inicio")
        if fecha_inicio and v and v <= fecha_inicio:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio")
        return v

    @field_validator("dosis", "instrucciones_toma")
    @classmethod
    def limpiar_texto(cls, v):
        return v.strip().capitalize() if v else v


class MedicinaDetalleOut(BaseModel):
    id_detalle: int
    id_medicina: int
    rut_paciente: int
    dosis: str
    instrucciones_toma: str
    fecha_inicio: datetime
    fecha_fin: datetime
    tomada: bool
    # NUEVO
    fecha_tomada: datetime | None

    class Config:
        from_attributes = True

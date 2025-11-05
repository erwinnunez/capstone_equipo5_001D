# app/schemas/notificacion.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal

class NotificacionBase(BaseModel):
    tipo: Literal["alerta_fuera_rango", "recordatorio", "info"]
    severidad: Literal["critica", "moderada", "leve", "info"]
    titulo: str
    mensaje: str

class NotificacionOut(NotificacionBase):
    id_notificacion: int
    rut_paciente: int
    rut_cuidador: Optional[int] = None
    leida: bool
    enviado_email: bool
    creada_en: datetime
    class Config:
        from_attributes = True


class PreferenciaNotificacionIn(BaseModel):
    recibir_criticas: bool = True
    recibir_moderadas: bool = True
    recibir_leves: bool = False
    canal_app: bool = True
    canal_email: bool = True

class PreferenciaNotificacionOut(PreferenciaNotificacionIn):
    rut_cuidador: int

# app/models/preferencia_notificacion.py
from sqlalchemy import Column, Integer, Boolean, Time, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db import Base

class PreferenciaNotificacion(Base):
    __tablename__ = "preferencia_notificacion"

    rut_cuidador = Column(Integer, ForeignKey("cuidador.rut_cuidador", ondelete="CASCADE"), primary_key=True)
    recibir_criticas  = Column(Boolean, nullable=False, default=True)
    recibir_moderadas = Column(Boolean, nullable=False, default=True)
    recibir_leves     = Column(Boolean, nullable=False, default=False)

    canal_app   = Column(Boolean, nullable=False, default=True)
    canal_email = Column(Boolean, nullable=False, default=False)

    # silencio opcional (no bloqueará creación, solo envío)
    silencio_desde = Column(Time, nullable=True)
    silencio_hasta = Column(Time, nullable=True)

    actualizado_en = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    cuidador = relationship("Cuidador", lazy="joined")

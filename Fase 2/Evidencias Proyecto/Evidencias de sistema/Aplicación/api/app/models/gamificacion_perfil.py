from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class GamificacionPerfil(Base):
    __tablename__ = "gamificacion_perfil"

    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"),
                        primary_key=True, index=True)
    puntos = Column(Integer, nullable=False, default=0)
    racha_dias = Column(Integer, nullable=False, default=0)
    ultima_actividad = Column(DateTime, nullable=True, default=datetime.utcnow)

    paciente = relationship("Paciente", back_populates="gamificacion", lazy="joined")

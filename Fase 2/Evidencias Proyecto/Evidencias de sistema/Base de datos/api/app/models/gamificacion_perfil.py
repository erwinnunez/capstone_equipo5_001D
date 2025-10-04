from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class GamificacionPerfil(Base):
    __tablename__ = "gamificacion_perfil"

    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), primary_key=True, index=True)
    puntos = Column(Integer, nullable=False)
    racha_dias = Column(Integer, nullable=False)
    ultima_actividad = Column(DateTime(timezone=True), nullable=False)

    paciente = relationship("Paciente", back_populates="gamificacion", lazy="joined")

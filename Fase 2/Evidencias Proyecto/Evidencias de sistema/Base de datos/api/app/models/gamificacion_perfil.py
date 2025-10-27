# app/models/gamificacion_perfil.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class GamificacionPerfil(Base):
    __tablename__ = "gamificacion_perfil"

    rut_paciente = Column(String, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), primary_key=True, index=True)  # ← String
    puntos = Column(Integer, nullable=False)
    racha_dias = Column(Integer, nullable=False)
    ultima_actividad = Column(DateTime(timezone=True), nullable=False)

    paciente = relationship("Paciente", back_populates="gamificacion", lazy="joined")

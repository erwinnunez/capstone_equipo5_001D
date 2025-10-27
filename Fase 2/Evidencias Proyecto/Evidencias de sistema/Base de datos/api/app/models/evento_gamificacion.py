# app/models/evento_gamificacion.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class EventoGamificacion(Base):
    __tablename__ = "evento_gamificacion"

    id_evento = Column(Integer, primary_key=True, index=True)
    rut_paciente = Column(String, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)  # ← String
    tipo = Column(String, nullable=False)
    puntos = Column(Integer, nullable=False)
    fecha = Column(DateTime(timezone=True), nullable=False)

    paciente = relationship("Paciente", back_populates="eventos_gamificacion", lazy="joined")

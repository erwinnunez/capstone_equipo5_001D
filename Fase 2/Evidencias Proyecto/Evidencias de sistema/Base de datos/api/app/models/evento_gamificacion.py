from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class EventoGamificacion(Base):
    __tablename__ = "evento_gamificacion"

    id_evento = Column(Integer, primary_key=True, index=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)
    tipo = Column(String, nullable=False)
    puntos = Column(Integer, nullable=False)
    fecha = Column(DateTime(timezone=True), nullable=False)

    paciente = relationship("Paciente", back_populates="eventos_gamificacion", lazy="joined")

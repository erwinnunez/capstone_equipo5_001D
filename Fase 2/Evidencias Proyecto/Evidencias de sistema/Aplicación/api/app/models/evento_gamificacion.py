from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class EventoGamificacion(Base):
    __tablename__ = "evento_gamificacion"

    id_evento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)
    puntos = Column(Integer, nullable=False, default=0)
    fecha = Column(DateTime, nullable=False, default=datetime.utcnow)

    paciente = relationship("Paciente", back_populates="eventos_gamificacion", lazy="joined")

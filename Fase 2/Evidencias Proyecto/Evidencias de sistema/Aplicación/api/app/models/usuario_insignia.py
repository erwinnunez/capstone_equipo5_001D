from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class UsuarioInsignia(Base):
    __tablename__ = "usuario_insignia"

    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), primary_key=True)
    id_insignia  = Column(Integer, ForeignKey("insignia.id_insignia", ondelete="CASCADE"), primary_key=True)
    otorgada_en  = Column(DateTime, default=datetime.utcnow, nullable=False)

    paciente = relationship("Paciente", back_populates="insignias", lazy="joined")
    insignia = relationship("Insignia", back_populates="usuarios", lazy="joined")

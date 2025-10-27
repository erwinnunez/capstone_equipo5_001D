# app/models/usuario_insignia.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class UsuarioInsignia(Base):
    __tablename__ = "usuario_insignia"

    rut_paciente = Column(String, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), primary_key=True, index=True)  # ← String
    id_insignia = Column(Integer, ForeignKey("insignia.id_insignia", ondelete="RESTRICT"), primary_key=True, index=True)
    otorgada_en = Column(DateTime(timezone=True), nullable=False)

    paciente = relationship("Paciente", back_populates="insignias", lazy="joined")
    insignia = relationship("Insignia", back_populates="usuarios", lazy="joined")

# app/models/paciente_historial.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class PacienteHistorial(Base):
    __tablename__ = "paciente_historial"

    historial_id = Column(Integer, primary_key=True, index=True)
    rut_paciente = Column(String, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)  # ← String
    fecha_cambio = Column(DateTime(timezone=True), nullable=False)
    cambio = Column(String, nullable=False)
    resultado = Column(Boolean, nullable=False)

    paciente = relationship("Paciente", back_populates="historiales", lazy="joined")

# app/models/medico_historial.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class MedicoHistorial(Base):
    __tablename__ = "medico_historial"

    historial_id = Column(Integer, primary_key=True, index=True)
    rut_medico = Column(String, ForeignKey("equipo_medico.rut_medico", ondelete="CASCADE"), nullable=False, index=True)  # ← String
    fecha_cambio = Column(DateTime(timezone=True), nullable=False)
    cambio = Column(String, nullable=False)
    resultado = Column(Boolean, nullable=False)

    medico = relationship("EquipoMedico", back_populates="historiales", lazy="joined")

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class MedicoHistorial(Base):
    __tablename__ = "medico_historial"

    historial_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut_medico = Column(Integer, ForeignKey("equipo_medico.rut_medico", ondelete="CASCADE"), nullable=False, index=True)
    fecha_cambio = Column(DateTime, nullable=False, default=datetime.utcnow)
    cambio = Column(String, nullable=True)
    resultado = Column(Boolean, nullable=True)

    medico = relationship("EquipoMedico", back_populates="historiales", lazy="joined")

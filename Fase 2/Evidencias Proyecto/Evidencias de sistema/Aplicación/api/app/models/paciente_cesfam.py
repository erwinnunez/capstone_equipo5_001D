from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class PacienteCesfam(Base):
    __tablename__ = "paciente_cesfam"

    id_pc = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)
    id_cesfam = Column(Integer, ForeignKey("cesfam.id_cesfam", ondelete="RESTRICT"), nullable=False, index=True)

    fecha_inicio = Column(DateTime, nullable=False, default=datetime.utcnow)
    fecha_fin = Column(DateTime, nullable=True)
    activo = Column(Boolean, nullable=False, default=True)

    paciente = relationship("Paciente", back_populates="vinculos_cesfam", lazy="joined")
    cesfam = relationship("Cesfam", back_populates="pacientes", lazy="joined")

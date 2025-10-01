from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class PacienteCuidador(Base):
    __tablename__ = "paciente_cuidador"

    id_pcuid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)
    rut_cuidador = Column(Integer, ForeignKey("cuidador.rut_cuidador", ondelete="CASCADE"), nullable=False, index=True)

    relacion = Column(String, nullable=True)
    fecha_inicio = Column(DateTime, nullable=False, default=datetime.utcnow)
    fecha_fin = Column(DateTime, nullable=True)
    activo = Column(Boolean, nullable=False, default=True)

    paciente = relationship("Paciente", back_populates="cuidadores", lazy="joined")
    cuidador = relationship("Cuidador", back_populates="pacientes", lazy="joined")

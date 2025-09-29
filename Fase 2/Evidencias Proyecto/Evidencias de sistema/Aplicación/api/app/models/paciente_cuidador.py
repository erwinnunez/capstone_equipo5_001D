from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class PacienteCuidador(Base):
    __tablename__ = "paciente_cuidador"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False)
    rut_cuidador = Column(Integer, ForeignKey("cuidador.rut_cuidador", ondelete="CASCADE"), nullable=False)
    permiso_registro = Column(Boolean, default=False, nullable=False)
    permiso_lectura = Column(Boolean, default=True, nullable=False)
    fecha_inicio = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_fin = Column(DateTime, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    paciente = relationship("Paciente", back_populates="cuidadores", lazy="joined")
    cuidador = relationship("Cuidador", back_populates="pacientes", lazy="joined")

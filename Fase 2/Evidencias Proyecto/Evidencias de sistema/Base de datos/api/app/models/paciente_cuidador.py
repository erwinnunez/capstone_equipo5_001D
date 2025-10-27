# app/models/paciente_cuidador.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class PacienteCuidador(Base):
    __tablename__ = "paciente_cuidador"

    rut_paciente = Column(String, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), primary_key=True, index=True)  # ← String
    rut_cuidador = Column(String, ForeignKey("cuidador.rut_cuidador", ondelete="CASCADE"), primary_key=True, index=True)
    permiso_registro = Column(Boolean, nullable=False)
    permiso_lectura = Column(Boolean, nullable=False)
    fecha_inicio = Column(DateTime(timezone=True), nullable=False)
    fecha_fin = Column(DateTime(timezone=True), nullable=False)
    activo = Column(Boolean, nullable=False)

    paciente = relationship("Paciente", back_populates="paciente_cuidadores", lazy="joined")
    cuidador = relationship("Cuidador", back_populates="pacientes", lazy="joined")

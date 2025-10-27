# app/models/nota_clinica.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class NotaClinica(Base):
    __tablename__ = "nota_clinica"

    id_nota = Column(Integer, primary_key=True, index=True)
    rut_paciente = Column(String, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)  # ← String
    rut_medico = Column(String, ForeignKey("equipo_medico.rut_medico", ondelete="RESTRICT"), nullable=False, index=True)  # ← String
    tipo_autor = Column(String, nullable=False)
    nota = Column(String, nullable=False)
    tipo_nota = Column(String, nullable=False)
    creada_en = Column(DateTime(timezone=True), nullable=False)
    id_cesfam = Column(Integer, ForeignKey("cesfam.id_cesfam"))

    paciente = relationship("Paciente", back_populates="notas", lazy="joined")
    medico = relationship("EquipoMedico", back_populates="notas", lazy="joined")
    cesfam = relationship("Cesfam", back_populates="notas", viewonly=True)

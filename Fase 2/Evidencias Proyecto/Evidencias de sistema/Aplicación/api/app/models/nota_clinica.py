from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class NotaClinica(Base):
    __tablename__ = "nota_clinica"

    id_nota = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)
    rut_medico = Column(Integer, ForeignKey("equipo_medico.rut_medico", ondelete="RESTRICT"), nullable=False, index=True)
    id_cesfam = Column(Integer, ForeignKey("cesfam.id_cesfam", ondelete="RESTRICT"), nullable=False, index=True)

    fecha_registro = Column(DateTime, nullable=False, default=datetime.utcnow)
    observacion = Column(String, nullable=True)
    evidencia_bin = Column(String, nullable=True)   # placeholder; cambiar a LargeBinary si usas binario real
    evidencia_url = Column(String, nullable=True)
    severidad_max = Column(Integer, nullable=True)
    resumen_alerta = Column(String, nullable=True)

    paciente = relationship("Paciente", back_populates="notas", lazy="joined")
    medico = relationship("EquipoMedico", back_populates="notas", lazy="joined")
    cesfam = relationship("Cesfam", back_populates="notas", lazy="joined")

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class SolicitudReporte(Base):
    __tablename__ = "solicitud_reporte"

    id_reporte = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut_medico = Column(Integer, ForeignKey("equipo_medico.rut_medico", ondelete="RESTRICT"), nullable=False, index=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="RESTRICT"), nullable=False, index=True)
    estado = Column(String, nullable=False, default="pendiente")  # pendiente|listo|rechazado, etc.
    creado_en = Column(DateTime, nullable=False, default=datetime.utcnow)
    observacion = Column(String, nullable=True)

    medico = relationship("EquipoMedico", lazy="joined")
    paciente = relationship("Paciente", lazy="joined")
    descargas = relationship("DescargaReporte", back_populates="reporte", cascade="all,delete")

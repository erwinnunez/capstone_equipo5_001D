from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class SolicitudReporte(Base):
    __tablename__ = "solicitud_reporte"

    id_reporte = Column(Integer, primary_key=True, index=True)
    rut_medico = Column(Integer, ForeignKey("equipo_medico.rut_medico", ondelete="RESTRICT"), nullable=False, index=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="RESTRICT"), nullable=False, index=True)
    rango_desde = Column(DateTime(timezone=True), nullable=False)
    rango_hasta = Column(DateTime(timezone=True), nullable=False)
    tipo = Column(String, nullable=False)
    formato = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    creado_en = Column(DateTime(timezone=True), nullable=False)

    medico = relationship("EquipoMedico", back_populates="solicitudes", lazy="joined")
    paciente = relationship("Paciente", back_populates=None, lazy="joined")
    descargas = relationship("DescargaReporte", back_populates="reporte", viewonly=True)
    mediciones = relationship("Medicion", back_populates="solicitud", viewonly=True)

# app/models/solicitud_reporte.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class SolicitudReporte(Base):
    __tablename__ = "solicitud_reporte"

    id_reporte = Column(Integer, primary_key=True, index=True)
    rut_medico = Column(String, ForeignKey("equipo_medico.rut_medico", ondelete="RESTRICT"), nullable=False, index=True)  # ← String
    rango_desde = Column(DateTime(timezone=True), nullable=False)
    rango_hasta = Column(DateTime(timezone=True), nullable=False)
    tipo = Column(String, nullable=False)
    formato = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    creado_en = Column(DateTime(timezone=True), nullable=False)

    medico = relationship("EquipoMedico", back_populates="solicitudes", lazy="joined")
    # Relación paciente eliminada
    descargas = relationship("DescargaReporte", back_populates="reporte", viewonly=True)
    mediciones = relationship("Medicion", back_populates="solicitud", viewonly=True)

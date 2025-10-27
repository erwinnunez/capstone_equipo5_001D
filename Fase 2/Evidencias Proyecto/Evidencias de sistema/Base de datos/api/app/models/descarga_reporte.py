# app/models/descarga_reporte.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class DescargaReporte(Base):
    __tablename__ = "descarga_reporte"

    id_descarga = Column(Integer, primary_key=True, index=True, autoincrement=True)

    rut_medico = Column(String, ForeignKey("equipo_medico.rut_medico", ondelete="RESTRICT"), nullable=False, index=True)  # ← String
    id_reporte = Column(Integer, ForeignKey("solicitud_reporte.id_reporte", ondelete="CASCADE"), nullable=False, index=True)
    descargado_en = Column(DateTime(timezone=True), nullable=False)

    medico = relationship("EquipoMedico", lazy="joined")
    reporte = relationship("SolicitudReporte", lazy="joined")

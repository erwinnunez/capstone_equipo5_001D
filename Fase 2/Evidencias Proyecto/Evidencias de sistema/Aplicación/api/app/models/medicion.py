from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Medicion(Base):
    __tablename__ = "medicion"

    id_medicion = Column(Integer, primary_key=True, index=True)
    rut_paciente = Column(Integer, ForeignKey("solicitud_reporte.rut_paciente", ondelete="RESTRICT"), nullable=False, index=True)
    fecha_registro = Column(DateTime(timezone=True), nullable=False)
    origen = Column(String, nullable=False)
    registrado_por = Column(String, nullable=False)
    observacion = Column(String, nullable=False)
    evaluada_en = Column(DateTime(timezone=True), nullable=False)
    tiene_alerta = Column(Boolean, nullable=False)
    severidad_max = Column(String, nullable=False)
    resumen_alerta = Column(String, nullable=False)

    detalles = relationship("MedicionDetalle", back_populates="medicion", cascade="all,delete")
    solicitud = relationship("SolicitudReporte", back_populates="mediciones", lazy="joined", viewonly=True)

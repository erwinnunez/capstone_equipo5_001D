# app/models/medicion.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Medicion(Base):
    __tablename__ = "medicion"

    id_medicion = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ✅ FK correcta: a paciente.rut_paciente (NO a solicitud_reporte)
    rut_paciente = Column(
        Integer,
        ForeignKey("paciente.rut_paciente", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    fecha_registro = Column(DateTime(timezone=True), nullable=False)
    origen = Column(String, nullable=False)            # p.ej. 'APP', 'WEB', 'BLE'
    registrado_por = Column(String, nullable=False)    # quién registró
    observacion = Column(String, nullable=False)

    evaluada_en = Column(DateTime(timezone=True), nullable=False)
    tiene_alerta = Column(Boolean, nullable=False, default=False)
    severidad_max = Column(String, nullable=False)
    resumen_alerta = Column(String, nullable=False)

    # Relaciones ORM
    paciente = relationship("Paciente", lazy="joined")
    detalles = relationship(
        "MedicionDetalle",
        back_populates="medicion",
        cascade="all,delete-orphan",
        passive_deletes=True,
    )

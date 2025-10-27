# app/models/medicion.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db import Base

class Medicion(Base):
    __tablename__ = "medicion"

    id_medicion = Column(Integer, primary_key=True, index=True, autoincrement=True)

    rut_paciente = Column(
        Integer,
        ForeignKey("paciente.rut_paciente", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    id_reporte = Column(
        Integer,
        ForeignKey("solicitud_reporte.id_reporte", ondelete="RESTRICT"),
        nullable=True,   # puede existir sin solicitud
        index=True
    )

    fecha_registro = Column(DateTime(timezone=True), nullable=False)
    origen = Column(String, nullable=False)            # 'APP' | 'WEB' | 'BLE' ...
    registrado_por = Column(String, nullable=False)
    observacion = Column(String, nullable=False)

    evaluada_en = Column(DateTime(timezone=True), nullable=False)
    tiene_alerta = Column(Boolean, nullable=False, default=False)
    severidad_max = Column(String, nullable=False)
    resumen_alerta = Column(String, nullable=False)

    # === Gestión de alerta (claim / estado) ===
    estado_alerta = Column(String, nullable=False, default="nueva")  # nueva|en_proceso|resuelta|ignorada
    tomada_por = Column(Integer, ForeignKey("equipo_medico.rut_medico", ondelete="RESTRICT"), nullable=True, index=True)
    tomada_en = Column(DateTime(timezone=True), nullable=True)

    # Relaciones ORM
    solicitud = relationship("SolicitudReporte", back_populates="mediciones", lazy="joined")
    paciente = relationship("Paciente", lazy="joined")
    medico_tomador = relationship("EquipoMedico", lazy="joined")

    detalles = relationship(
        "MedicionDetalle",
        back_populates="medicion",
        cascade="all,delete-orphan",
        passive_deletes=True,
    )

# Índices recomendados
Index("ix_medicion_alerta_estado_fecha", Medicion.tiene_alerta, Medicion.estado_alerta, Medicion.fecha_registro.desc())
Index("ix_medicion_tomada_por_estado", Medicion.tomada_por, Medicion.estado_alerta)

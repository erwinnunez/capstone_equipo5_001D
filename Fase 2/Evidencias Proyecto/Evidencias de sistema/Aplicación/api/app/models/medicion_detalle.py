from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class MedicionDetalle(Base):
    __tablename__ = "medicion_detalle"

    id_detalle = Column(Integer, primary_key=True, index=True)
    id_medicion = Column(Integer, ForeignKey("medicion.id_medicion", ondelete="CASCADE"), nullable=False, index=True)
    id_parametro = Column(Integer, ForeignKey("parametro_clinico.id_parametro", ondelete="RESTRICT"), nullable=False, index=True)
    id_unidad = Column(Integer, ForeignKey("unidad_medida.id_unidad", ondelete="RESTRICT"), nullable=False, index=True)

    valor_num = Column(Integer, nullable=False)     # DDL no da tipo → INT asumido
    valor_texto = Column(String, nullable=False)
    fuera_rango = Column(Boolean, nullable=False)
    severidad = Column(String, nullable=False)
    umbral_min = Column(Integer, nullable=False)
    umbral_max = Column(Integer, nullable=False)
    tipo_alerta = Column(String, nullable=False)

    medicion = relationship("Medicion", back_populates="detalles", lazy="joined")
    parametro = relationship("ParametroClinico", back_populates="medicion_detalles", lazy="joined")
    unidad = relationship("UnidadMedida", back_populates="medicion_detalles", lazy="joined")

    # Acceso al paciente (no hay FK directa en DDL; lo exponemos vía relación inversa en Paciente con viewonly)
    paciente = relationship("Paciente", viewonly=True, primaryjoin="Medicion.rut_paciente==SolicitudReporte.rut_paciente", uselist=False)

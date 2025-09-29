from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class Medicion(Base):
    __tablename__ = "medicion"

    id_registro = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)
    id_parametro = Column(Integer, ForeignKey("parametro_clinico.id_parametro", ondelete="RESTRICT"), nullable=False, index=True)

    valor_num = Column(Float, nullable=True)
    valor_txt = Column(String(60), nullable=True)
    fecha_lectura = Column(DateTime, default=datetime.utcnow, nullable=False)
    enviada_bn = Column(Boolean, default=False, nullable=False)
    severidad_max = Column(Integer, nullable=True)
    resumen_alerta = Column(String(200), nullable=True)

    paciente = relationship("Paciente", back_populates="mediciones", lazy="joined")
    parametro = relationship("ParametroClinico", back_populates="mediciones", lazy="joined")
    detalles = relationship("MedicionDetalle", back_populates="medicion", cascade="all,delete-orphan")

class MedicionDetalle(Base):
    __tablename__ = "medicion_detalle"

    id_detalle = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_registro = Column(Integer, ForeignKey("medicion.id_registro", ondelete="CASCADE"), nullable=False, index=True)
    id_parametro = Column(Integer, ForeignKey("parametro_clinico.id_parametro", ondelete="RESTRICT"), nullable=False)

    valor_num = Column(Float, nullable=True)
    valor_txt = Column(String(60), nullable=True)
    umbral_min = Column(Integer, nullable=True)
    umbral_max = Column(Integer, nullable=True)

    medicion = relationship("Medicion", back_populates="detalles", lazy="joined")

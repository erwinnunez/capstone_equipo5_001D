# app/models/notificacion.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db import Base
import enum

class Severidad(str, enum.Enum):
    critica = "critica"
    moderada = "moderada"
    leve = "leve"
    info = "info"

class TipoEvento(str, enum.Enum):
    alerta_fuera_rango = "alerta_fuera_rango"
    recordatorio = "recordatorio"
    info = "info"

class Notificacion(Base):
    __tablename__ = "notificacion"

    id_notificacion = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Destino y contexto
    rut_paciente   = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)
    rut_cuidador   = Column(Integer, ForeignKey("cuidador.rut_cuidador", ondelete="CASCADE"), nullable=True, index=True)
    rut_medico     = Column(Integer, ForeignKey("equipo_medico.rut_medico", ondelete="CASCADE"), nullable=True, index=True)

    # Fuente opcional (si viene de evaluación)
    id_medicion        = Column(Integer, ForeignKey("medicion.id_medicion", ondelete="SET NULL"), nullable=True)
    id_medicion_detalle= Column(Integer, ForeignKey("medicion_detalle.id_detalle", ondelete="SET NULL"), nullable=True)

    tipo      = Column(Enum(TipoEvento), nullable=False, default=TipoEvento.alerta_fuera_rango)
    severidad = Column(Enum(Severidad), nullable=False, default=Severidad.info)

    titulo   = Column(String, nullable=False)
    mensaje  = Column(String, nullable=False)

    # Estado entrega/lectura
    enviado_app   = Column(Boolean, nullable=False, default=True)
    enviado_email = Column(Boolean, nullable=False, default=False)
    leida         = Column(Boolean, nullable=False, default=False)
    leida_en      = Column(DateTime(timezone=True), nullable=True)

    creada_en     = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    # Relaciones (opcionales para eager loading)
    paciente = relationship("Paciente", lazy="joined")
    cuidador = relationship("Cuidador", lazy="joined")
    medico   = relationship("EquipoMedico", lazy="joined")

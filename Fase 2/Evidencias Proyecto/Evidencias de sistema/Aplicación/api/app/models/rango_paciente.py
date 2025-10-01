from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class RangoPaciente(Base):
    __tablename__ = "rango_paciente"

    id_rango = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)
    id_parametro = Column(Integer, ForeignKey("parametro_clinico.id_parametro", ondelete="CASCADE"), nullable=False, index=True)

    min_normal = Column(Integer, nullable=True)
    max_normal = Column(Integer, nullable=True)
    min_critico = Column(Integer, nullable=True)
    max_critico = Column(Integer, nullable=True)

    vigencia_desde = Column(DateTime, default=datetime.utcnow, nullable=False)
    vigencia_hasta = Column(DateTime, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    definido_por = Column(Boolean, default=False, nullable=False)

    paciente = relationship("Paciente", back_populates="rangos", lazy="joined")
    parametro = relationship("ParametroClinico", back_populates="rangos", lazy="joined")

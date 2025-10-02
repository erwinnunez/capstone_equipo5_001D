from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class RangoPaciente(Base):
    __tablename__ = "rango_paciente"

    id_rango = Column(Integer, primary_key=True, index=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)
    id_parametro = Column(Integer, ForeignKey("parametro_clinico.id_parametro", ondelete="RESTRICT"), nullable=False, index=True)

    min_normal = Column(Integer, nullable=False)
    max_normal = Column(Integer, nullable=False)
    min_critico = Column(Integer, nullable=False)
    max_critico = Column(Integer, nullable=False)
    vigencia_desde = Column(DateTime(timezone=True), nullable=False)
    vigencia_hasta = Column(DateTime(timezone=True), nullable=False)
    version = Column(Integer, nullable=False)
    definido_por = Column(Boolean, nullable=False)

    paciente = relationship("Paciente", lazy="joined")
    parametro = relationship("ParametroClinico", back_populates="rangos", lazy="joined")

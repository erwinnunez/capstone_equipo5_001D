from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class ParametroClinico(Base):
    __tablename__ = "parametro_clinico"
    id_parametro = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_unidad = Column(Integer, ForeignKey("unidad_medida.id_unidad", ondelete="RESTRICT"), nullable=False, index=True)
    codigo = Column(String(30), unique=True, nullable=False, index=True)
    descripcion = Column(String(150), nullable=False)
    rango_ref_min = Column(Integer, nullable=True)
    rango_ref_max = Column(Integer, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    unidad = relationship("UnidadMedida", back_populates="parametros", lazy="joined")
    rangos_paciente = relationship("RangoPaciente", back_populates="parametro", cascade="all,delete-orphan")
    mediciones = relationship("Medicion", back_populates="parametro")

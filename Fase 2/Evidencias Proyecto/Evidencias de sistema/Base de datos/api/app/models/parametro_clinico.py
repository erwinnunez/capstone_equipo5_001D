from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class ParametroClinico(Base):
    __tablename__ = "parametro_clinico"

    id_parametro = Column(Integer, primary_key=True, index=True)
    id_unidad = Column(Integer, ForeignKey("unidad_medida.id_unidad", ondelete="RESTRICT"), nullable=False, index=True)
    codigo = Column(String, nullable=False)
    descipcion = Column(String, nullable=False)
    rango_ref_min = Column(Integer, nullable=False)
    rango_ref_max = Column(Integer, nullable=False)

    unidad = relationship("UnidadMedida", back_populates="parametros", lazy="joined")
    rangos = relationship("RangoPaciente", back_populates="parametro", cascade="all,delete")
    medicion_detalles = relationship("MedicionDetalle", back_populates="parametro")

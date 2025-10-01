from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class ParametroClinico(Base):
    __tablename__ = "parametro_clinico"

    id_parametro = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_parametro = Column(String, nullable=False, unique=True)
    id_unidad = Column(Integer, ForeignKey("unidad_medida.id_unidad", ondelete="RESTRICT"), nullable=False)

    unidad = relationship("UnidadMedida", back_populates="parametros", lazy="joined")
    mediciones = relationship("Medicion", back_populates="parametro")
    detalles = relationship("MedicionDetalle", back_populates="parametro")
    rangos = relationship("RangoPaciente", back_populates="parametro")

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base

class UnidadMedida(Base):
    __tablename__ = "unidad_medida"

    id_unidad = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, nullable=False)
    descipcion = Column(String, nullable=False)

    parametros = relationship("ParametroClinico", back_populates="unidad", cascade="all,delete")
    medicinas = relationship("Medicina", back_populates="unidad")
    medicion_detalles = relationship("MedicionDetalle", back_populates="unidad")

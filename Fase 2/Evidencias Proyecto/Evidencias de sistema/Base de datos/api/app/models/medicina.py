from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Medicina(Base):
    __tablename__ = "medicina"

    id_medicina = Column(Integer, primary_key=True, index=True)
    id_unidad = Column(Integer, ForeignKey("unidad_medida.id_unidad", ondelete="RESTRICT"), nullable=False, index=True)
    nombre = Column(String, nullable=False)
    instrucciones = Column(String, nullable=False)
    toma_maxima = Column(String, nullable=False)
    efectos = Column(String, nullable=False)

    unidad = relationship("UnidadMedida", back_populates="medicinas", lazy="joined")
    detalles = relationship("MedicinaDetalle", back_populates="medicina", cascade="all,delete")

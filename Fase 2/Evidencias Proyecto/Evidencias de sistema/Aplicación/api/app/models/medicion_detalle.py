from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class MedicionDetalle(Base):
    __tablename__ = "medicion_detalle"

    id_detalle = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_registro = Column(Integer, ForeignKey("medicion.id_registro", ondelete="CASCADE"), nullable=False, index=True)
    id_parametro = Column(Integer, ForeignKey("parametro_clinico.id_parametro", ondelete="RESTRICT"), nullable=False, index=True)

    valor_num = Column(Float, nullable=True)
    valor_txt = Column(String(60), nullable=True)
    umbral_min = Column(Integer, nullable=True)
    umbral_max = Column(Integer, nullable=True)

    medicion = relationship("Medicion", back_populates="detalles", lazy="joined")
    parametro = relationship("ParametroClinico", back_populates="detalles", lazy="joined")

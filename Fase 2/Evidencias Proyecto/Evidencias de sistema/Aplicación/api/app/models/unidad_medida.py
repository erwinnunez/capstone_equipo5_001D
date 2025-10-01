from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base

class UnidadMedida(Base):
    __tablename__ = "unidad_medida"

    id_unidad = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_unidad = Column(String, nullable=False, unique=True)
    simbolo = Column(String, nullable=True)

    parametros = relationship("ParametroClinico", back_populates="unidad", cascade="all,delete")

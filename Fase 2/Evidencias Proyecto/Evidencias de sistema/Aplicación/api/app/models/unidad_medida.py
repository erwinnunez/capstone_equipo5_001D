from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base

class UnidadMedida(Base):
    __tablename__ = "unidad_medida"
    id_unidad = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    descripcion = Column(String(100), nullable=False)

    parametros = relationship("ParametroClinico", back_populates="unidad", cascade="all,delete")

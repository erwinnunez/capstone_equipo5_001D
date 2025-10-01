from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db import Base

class Cuidador(Base):
    __tablename__ = "cuidador"

    rut_cuidador = Column(Integer, primary_key=True, index=True)
    nombre_cuidador = Column(String, nullable=False)
    apellido_cuidador = Column(String, nullable=False)
    sexo = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    email = Column(String, nullable=True)
    estado = Column(Boolean, default=True, nullable=False)

    pacientes = relationship("PacienteCuidador", back_populates="cuidador", cascade="all,delete")
    historiales = relationship("CuidadorHistorial", back_populates="cuidador", cascade="all,delete")

from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db import Base

class Cuidador(Base):
    __tablename__ = "cuidador"

    rut_cuidador = Column(Integer, primary_key=True, index=True)
    nombre_cuidador = Column(String(60), nullable=False)
    apellido_cuidador = Column(String(60), nullable=False)
    sexo = Column(String(1), nullable=True)
    direccion = Column(String(120), nullable=True)
    telefono = Column(String(30), nullable=True)
    email = Column(String(120), nullable=True)
    estado = Column(Boolean, default=True, nullable=False)

    pacientes = relationship("PacienteCuidador", back_populates="cuidador", cascade="all,delete-orphan")

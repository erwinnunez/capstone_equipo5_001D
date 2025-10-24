from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db import Base

class Cuidador(Base):
    __tablename__ = "cuidador"

    rut_cuidador = Column(Integer, primary_key=True, index=True)
    primer_nombre_cuidador = Column(String, nullable=False)
    segundo_nombre_cuidador = Column(String, nullable=False)
    primer_apellido_cuidador = Column(String, nullable=False)
    segundo_apellido_cuidador = Column(String, nullable=False)
    sexo = Column(Boolean, nullable=False)
    direccion = Column(String, nullable=False)
    telefono = Column(Integer, nullable=False)
    email = Column(String, nullable=False)
    contrasena = Column(String, nullable=False)
    estado = Column(Boolean, nullable=False)

    historiales = relationship("CuidadorHistorial", back_populates="cuidador", cascade="all,delete")
    pacientes = relationship("PacienteCuidador", back_populates="cuidador", cascade="all,delete")
    tareas = relationship("Tarea", back_populates="cuidador")

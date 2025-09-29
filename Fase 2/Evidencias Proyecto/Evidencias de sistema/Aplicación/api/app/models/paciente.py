from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Paciente(Base):
    __tablename__ = "paciente"

    rut_paciente = Column(Integer, primary_key=True, index=True)  # ajusta si usas otra PK
    id_comuna = Column(Integer, ForeignKey("comuna.id_comuna", ondelete="RESTRICT"), nullable=False)

    nombre_paciente = Column(String(60), nullable=False)
    apellido_paciente = Column(String(60), nullable=False)
    fecha_nacimiento = Column(Date, nullable=True)
    sexo = Column(String(1), nullable=True)
    tipo_sangre = Column(String(5), nullable=True)
    enfermedades = Column(String(250), nullable=True)
    direccion = Column(String(120), nullable=True)
    telefono = Column(String(30), nullable=True)
    email = Column(String(120), nullable=True)
    foto_paciente = Column(String(255), nullable=True)
    nombre_contacto = Column(String(60), nullable=True)
    telefono_contacto = Column(String(30), nullable=True)
    estado = Column(Boolean, default=True, nullable=False)

    cuidadores = relationship("PacienteCuidador", back_populates="paciente", cascade="all,delete-orphan")
    rangos = relationship("RangoPaciente", back_populates="paciente", cascade="all,delete-orphan")
    mediciones = relationship("Medicion", back_populates="paciente", cascade="all,delete-orphan")

from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Paciente(Base):
    __tablename__ = "paciente"

    rut_paciente = Column(Integer, primary_key=True, index=True)
    nombre_paciente = Column(String, nullable=False)
    apellido_paciente = Column(String, nullable=False)
    sexo = Column(String, nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    direccion = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    email = Column(String, nullable=True)
    estado = Column(Boolean, default=True, nullable=False)

    # relaciones
    vinculos_cesfam = relationship("PacienteCesfam", back_populates="paciente", cascade="all,delete")
    cuidadores = relationship("PacienteCuidador", back_populates="paciente", cascade="all,delete")
    historiales = relationship("PacienteHistorial", back_populates="paciente", cascade="all,delete")
    mediciones = relationship("Medicion", back_populates="paciente", cascade="all,delete-orphan")
    rangos = relationship("RangoPaciente", back_populates="paciente", cascade="all,delete")
    notas = relationship("NotaClinica", back_populates="paciente", cascade="all,delete")
    gamificacion = relationship("GamificacionPerfil", back_populates="paciente", uselist=False, cascade="all,delete")
    eventos_gamificacion = relationship("EventoGamificacion", back_populates="paciente", cascade="all,delete")
    insignias = relationship("UsuarioInsignia", back_populates="paciente", cascade="all,delete")
    id_comuna = Column(Integer, ForeignKey("comuna.id_comuna", ondelete="RESTRICT"), nullable=True, index=True)

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Paciente(Base):
    __tablename__ = "paciente"

    rut_paciente = Column(Integer, primary_key=True, index=True)
    id_comuna = Column(Integer, ForeignKey("comuna.id_comuna", ondelete="RESTRICT"), nullable=False, index=True)

    primer_nombre_paciente = Column(String, nullable=False)
    segundo_nombre_paciente = Column(String, nullable=False)
    primer_apellido_paciente = Column(String, nullable=False)
    segundo_apellido_paciente = Column(String, nullable=False)

    fecha_nacimiento = Column(DateTime(timezone=True), nullable=False)
    sexo = Column(Boolean, nullable=False)
    tipo_de_sangre = Column(String, nullable=False)
    enfermedades = Column(String, nullable=False)
    seguro = Column(String, nullable=False)

    direccion = Column(String, nullable=False)
    telefono = Column(Integer, nullable=False)
    email = Column(String, nullable=False)
    contrasena = Column(String, nullable=False)

    tipo_paciente = Column(String, nullable=False)
    nombre_contacto = Column(String, nullable=False)
    telefono_contacto = Column(Integer, nullable=False)

    estado = Column(Boolean, nullable=False)

    # relación directa con CESFAM (NO hay tabla intermedia)
    id_cesfam = Column(Integer, ForeignKey("cesfam.id_cesfam", ondelete="RESTRICT"), nullable=False, index=True)
    fecha_inicio_cesfam = Column(DateTime(timezone=True), nullable=False)
    fecha_fin_cesfam = Column(DateTime(timezone=True), nullable=True)
    activo_cesfam = Column(Boolean, nullable=False)

    # relaciones
    comuna = relationship("Comuna", back_populates="pacientes", lazy="joined")
    cesfam = relationship("Cesfam", back_populates="pacientes", lazy="joined")

    historiales = relationship("PacienteHistorial", back_populates="paciente", cascade="all,delete")
    paciente_cuidadores = relationship("PacienteCuidador", back_populates="paciente", cascade="all,delete")
    gamificacion = relationship("GamificacionPerfil", back_populates="paciente", cascade="all,delete", uselist=False)
    eventos_gamificacion = relationship("EventoGamificacion", back_populates="paciente", cascade="all,delete")
    insignias = relationship("UsuarioInsignia", back_populates="paciente", cascade="all,delete")
    notas = relationship("NotaClinica", back_populates="paciente", cascade="all,delete")

    # detalles
    medicion_detalles = relationship("MedicionDetalle", back_populates="paciente", viewonly=True)
    medicina_detalles = relationship("MedicinaDetalle", back_populates="paciente", cascade="all,delete")

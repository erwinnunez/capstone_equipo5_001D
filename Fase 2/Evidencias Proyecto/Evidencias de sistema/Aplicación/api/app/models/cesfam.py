from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Cesfam(Base):
    __tablename__ = "cesfam"

    id_cesfam = Column(Integer, primary_key=True, index=True)
    id_comuna = Column(Integer, ForeignKey("comuna.id_comuna", ondelete="RESTRICT"), nullable=False, index=True)
    nombre_cesfam = Column(String, nullable=False)
    telefono = Column(Integer, nullable=False)   # si en tu BD es VARCHAR, cambia a String
    direccion = Column(String, nullable=False)
    email = Column(String, nullable=False)
    estado = Column(Boolean, nullable=False)

    comuna = relationship("Comuna", back_populates="cesfams", lazy="joined")
    equipo_medico = relationship("EquipoMedico", back_populates="cesfam", cascade="all,delete")
    notas = relationship("NotaClinica", back_populates="cesfam", cascade="all,delete")

    # relación directa con pacientes (por FK paciente.id_cesfam)
    pacientes = relationship("Paciente", back_populates="cesfam")

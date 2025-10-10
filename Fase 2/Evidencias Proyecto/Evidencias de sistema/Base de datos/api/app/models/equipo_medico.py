# app/models/equipo_medico.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class EquipoMedico(Base):
    __tablename__ = "equipo_medico"

    rut_medico = Column(Integer, primary_key=True, index=True)
    id_cesfam = Column(Integer, ForeignKey("cesfam.id_cesfam", ondelete="RESTRICT"), nullable=False, index=True)

    primer_nombre_medico = Column(String, nullable=False)
    segundo_nombre_medico = Column(String, nullable=False)
    primer_apellido_medico = Column(String, nullable=False)
    segundo_apellido_medico = Column(String, nullable=False)

    email = Column(String, nullable=False)
    contrasenia = Column(String, nullable=False)
    telefono = Column(Integer, nullable=False)
    direccion = Column(String, nullable=False)
    rol = Column(String, nullable=False)
    especialidad = Column(String, nullable=False)
    estado = Column(Boolean, nullable=False)

    is_admin = Column(Boolean, nullable=False, default=False)

    cesfam = relationship("Cesfam", back_populates="equipo_medico", lazy="joined")
    historiales = relationship("MedicoHistorial", back_populates="medico", cascade="all,delete")
    notas = relationship("NotaClinica", back_populates="medico", cascade="all,delete")
    descargas = relationship("DescargaReporte", back_populates="medico", viewonly=True)
    solicitudes = relationship("SolicitudReporte", back_populates="medico", cascade="all,delete")

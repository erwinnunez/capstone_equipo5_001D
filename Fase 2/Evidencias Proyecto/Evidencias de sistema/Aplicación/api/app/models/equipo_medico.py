from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class EquipoMedico(Base):
    __tablename__ = "equipo_medico"

    rut_medico = Column(Integer, primary_key=True, index=True)
    id_cesfam = Column(Integer, ForeignKey("cesfam.id_cesfam", ondelete="RESTRICT"), nullable=False, index=True)
    nombre_medico = Column(String, nullable=False)
    apellido_medico = Column(String, nullable=False)
    telefono = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    email = Column(String, nullable=True)
    especialidad = Column(String, nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    cesfam = relationship("Cesfam", back_populates="equipo_medico", lazy="joined")
    notas = relationship("NotaClinica", back_populates="medico", cascade="all,delete")
    descargas = relationship("DescargaReporte", back_populates="medico", cascade="all,delete")
    historiales = relationship("MedicoHistorial", back_populates="medico", cascade="all,delete")

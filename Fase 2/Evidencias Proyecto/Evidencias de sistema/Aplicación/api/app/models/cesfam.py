from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Cesfam(Base):
    __tablename__ = "cesfam"

    id_cesfam = Column(Integer, primary_key=True, index=True)
    id_comuna = Column(Integer, ForeignKey("comuna.id_comuna", ondelete="RESTRICT"), nullable=False)
    nombre_cesfam = Column(String, nullable=False)
    telefono = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    email = Column(String, nullable=True)

    comuna = relationship("Comuna", back_populates="cesfams", lazy="joined")
    equipo_medico = relationship("EquipoMedico", back_populates="cesfam", cascade="all,delete")
    pacientes = relationship("PacienteCesfam", back_populates="cesfam", cascade="all,delete")
    notas = relationship("NotaClinica", back_populates="cesfam", cascade="all,delete")

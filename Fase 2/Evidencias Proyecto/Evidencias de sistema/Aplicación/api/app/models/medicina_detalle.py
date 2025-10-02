from sqlalchemy import Column, Integer, DateTime, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base 

class MedicinaDetalle(Base):
    __tablename__ = "medicina_detalle"
    
    id_detalle = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_medicina = Column(Integer, ForeignKey("medicina.id_medicina", ondelete="CASCADE"), nullable=False)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    tomada = Column(Boolean, nullable=False, default=False)
    fecha_registro = Column(DateTime, nullable=False, default=datetime.utcnow)

    medicina = relationship("Medicina", back_populates="pacientes", lazy="joined")
    paciente = relationship("Paciente", back_populates="medicinas", lazy="joined")
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class MedicinaDetalle(Base):
    __tablename__ = "medicina_detalle"

    id_detalle = Column(Integer, primary_key=True, index=True)

    id_medicina = Column(Integer,ForeignKey("medicina.id_medicina", ondelete="CASCADE"),nullable=False,index=True,)
    rut_paciente = Column(Integer,ForeignKey("paciente.rut_paciente", ondelete="CASCADE"),nullable=False,index=True,)

    dosis = Column(String, nullable=False)
    instrucciones_toma = Column(String, nullable=False)
    fecha_inicio = Column(DateTime(timezone=True), nullable=False)
    fecha_fin = Column(DateTime(timezone=True), nullable=False)

    # Estado actual
    tomada = Column(Boolean, nullable=False)

    # NUEVO: fecha/hora exacta en que se marcó como tomada (UTC)
    fecha_tomada = Column(DateTime(timezone=True), nullable=True)

    medicina = relationship("Medicina", back_populates="detalles", lazy="joined")
    paciente = relationship("Paciente", back_populates="medicina_detalles", lazy="joined")

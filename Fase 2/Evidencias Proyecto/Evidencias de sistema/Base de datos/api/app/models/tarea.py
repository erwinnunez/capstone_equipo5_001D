from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, func
from sqlalchemy.orm import relationship
from app.db import Base

class Tarea(Base):
    __tablename__ = "tarea"

    id_tarea = Column(Integer, primary_key=True, index=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente"), nullable=False)
    rut_doctor = Column(Integer, ForeignKey("equipo_medico.rut_medico"), nullable=False)
    rut_cuidador = Column(Integer, ForeignKey("cuidador.rut_cuidador"), nullable=True)  # opcional
    descripcion = Column(Text, nullable=False)
    creado = Column(DateTime(timezone=True), server_default=func.now())
    completado = Column(DateTime(timezone=True), nullable=True)
    nota_cuidador = Column(Text, nullable=True)

    # Relaciones
    paciente = relationship("Paciente", back_populates="tareas", lazy="joined")
    doctor = relationship("EquipoMedico",back_populates="tareas", lazy="joined")
    cuidador = relationship("Cuidador", back_populates="tareas", lazy="joined")
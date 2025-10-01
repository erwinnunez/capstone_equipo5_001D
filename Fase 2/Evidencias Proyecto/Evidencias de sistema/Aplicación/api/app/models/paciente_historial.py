from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.db import Base

class PacienteHistorial(Base):
    __tablename__ = "paciente_historial"

    historial_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut_paciente = Column(Integer, ForeignKey("paciente.rut_paciente", ondelete="CASCADE"), nullable=False, index=True)
    fecha_cambio = Column(DateTime, nullable=False, default=datetime.utcnow)
    cambio = Column(String, nullable=True)
    resultado = Column(Boolean, nullable=True)

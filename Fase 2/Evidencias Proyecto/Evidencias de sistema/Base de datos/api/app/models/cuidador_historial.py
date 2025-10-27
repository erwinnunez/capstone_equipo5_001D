from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class CuidadorHistorial(Base):
    __tablename__ = "cuidador_historial"

    historial_id = Column(Integer, primary_key=True, index=True)
    rut_cuidador = Column(String, ForeignKey("cuidador.rut_cuidador", ondelete="CASCADE"), nullable=False, index=True)
    fecha_cambio = Column(DateTime(timezone=True), nullable=False)
    cambio = Column(String, nullable=False)
    resultado = Column(Boolean, nullable=False)

    cuidador = relationship("Cuidador", back_populates="historiales", lazy="joined")

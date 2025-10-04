from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Comuna(Base):
    __tablename__ = "comuna"

    id_comuna = Column(Integer, primary_key=True, index=True)
    id_region = Column(Integer, ForeignKey("region.id_region", ondelete="RESTRICT"), nullable=False, index=True)
    nombre_comuna = Column(String, nullable=False, unique=True)

    region = relationship("Region", back_populates="comunas", lazy="joined")
    cesfams = relationship("Cesfam", back_populates="comuna", cascade="all,delete")
    pacientes = relationship("Paciente", back_populates="comuna")

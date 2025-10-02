from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base 

class Medicina(Base):
    __tablename__ = "medicina"

    id_medicina = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    dosis = Column(String(50), nullable=False)
    instrucciones = Column(String(500), nullable=True)
    
    paciente = relationship("MedicinaDetalle", back_populates="medicinas", cascade="all,delete-orphan")
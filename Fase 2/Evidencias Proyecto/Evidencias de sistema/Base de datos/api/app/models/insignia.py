from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base

class Insignia(Base):
    __tablename__ = "insignia"

    id_insignia = Column(Integer, primary_key=True, index=True)
    codigo = Column(Integer, nullable=False)
    nombre_insignia = Column(String, nullable=False)
    descipcion = Column(String, nullable=False)

    usuarios = relationship("UsuarioInsignia", back_populates="insignia", cascade="all,delete")

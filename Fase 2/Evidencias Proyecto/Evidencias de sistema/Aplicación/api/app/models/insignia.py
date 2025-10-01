from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base

class Insignia(Base):
    __tablename__ = "insignia"

    id_insignia = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String, unique=True, nullable=False, index=True)
    nombre_insignia = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)

    usuarios = relationship("UsuarioInsignia", back_populates="insignia", cascade="all,delete-orphan")

from sqlalchemy import Column, Integer, String
from app.db import Base

class Region(Base):
    __tablename__ = "region"
    id_region = Column(Integer, primary_key=True, index=True)
    nombre_region = Column(String, nullable=False, unique=True)

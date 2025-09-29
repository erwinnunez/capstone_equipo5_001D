from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.cuidador import Cuidador
from app.schemas.cuidador import CuidadorCreate, CuidadorRead

router = APIRouter(prefix="/cuidadores", tags=["Cuidadores"])

@router.post("", response_model=CuidadorRead, status_code=201)
def crear(data: CuidadorCreate, db: Session = Depends(get_db)):
    if db.get(Cuidador, data.rut_cuidador):
        raise HTTPException(409, "Cuidador ya existe")
    obj = Cuidador(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get("", response_model=list[CuidadorRead])
def listar(db: Session = Depends(get_db)):
    return db.query(Cuidador).order_by(Cuidador.rut_cuidador).all()

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.paciente_cuidador import PacienteCuidador
from app.schemas.paciente_cuidador import PacienteCuidadorCreate, PacienteCuidadorRead

router = APIRouter(prefix="/paciente-cuidador", tags=["Paciente–Cuidador"])

@router.post("", response_model=PacienteCuidadorRead, status_code=201)
def vincular(data: PacienteCuidadorCreate, db: Session = Depends(get_db)):
    obj = PacienteCuidador(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get("", response_model=list[PacienteCuidadorRead])
def listar(db: Session = Depends(get_db)):
    return db.query(PacienteCuidador).all()

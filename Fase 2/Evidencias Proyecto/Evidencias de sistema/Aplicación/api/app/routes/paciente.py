from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteRead

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])

@router.post("", response_model=PacienteRead, status_code=201)
def crear(data: PacienteCreate, db: Session = Depends(get_db)):
    if db.get(Paciente, data.rut_paciente):
        raise HTTPException(409, "Paciente ya existe")
    obj = Paciente(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get("/{rut}", response_model=PacienteRead)
def obtener(rut: int, db: Session = Depends(get_db)):
    obj = db.get(Paciente, rut)
    if not obj: raise HTTPException(404, "Paciente no encontrado")
    return obj

@router.get("", response_model=list[PacienteRead])
def listar(db: Session = Depends(get_db)):
    return db.query(Paciente).order_by(Paciente.rut_paciente).all()

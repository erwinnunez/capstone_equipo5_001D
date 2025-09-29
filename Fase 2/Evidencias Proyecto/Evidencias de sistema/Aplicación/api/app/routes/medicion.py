from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.medicion import Medicion, MedicionDetalle
from app.schemas.medicion import MedicionCreate, MedicionRead

router = APIRouter(prefix="/mediciones", tags=["Mediciones"])

@router.post("", response_model=MedicionRead, status_code=201)
def crear(data: MedicionCreate, db: Session = Depends(get_db)):
    obj = Medicion(**data.model_dump(exclude={"detalles"}))
    db.add(obj); db.flush()  # para tener id_registro
    for d in data.detalles:
        db.add(MedicionDetalle(id_registro=obj.id_registro, **d.model_dump()))
    db.commit(); db.refresh(obj)
    return obj

@router.get("", response_model=list[MedicionRead])
def listar(db: Session = Depends(get_db)):
    return db.query(Medicion).order_by(Medicion.fecha_lectura.desc()).all()

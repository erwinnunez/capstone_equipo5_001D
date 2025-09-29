from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.parametro_clinico import ParametroClinico
from app.schemas.parametro_clinico import ParametroClinicoCreate, ParametroClinicoRead

router = APIRouter(prefix="/parametros", tags=["Parámetros clínicos"])

@router.post("", response_model=ParametroClinicoRead, status_code=201)
def crear(data: ParametroClinicoCreate, db: Session = Depends(get_db)):
    if db.query(ParametroClinico).filter_by(codigo=data.codigo).first():
        raise HTTPException(409, "Código de parámetro ya existe")
    obj = ParametroClinico(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get("", response_model=list[ParametroClinicoRead])
def listar(db: Session = Depends(get_db)):
    return db.query(ParametroClinico).order_by(ParametroClinico.id_parametro).all()

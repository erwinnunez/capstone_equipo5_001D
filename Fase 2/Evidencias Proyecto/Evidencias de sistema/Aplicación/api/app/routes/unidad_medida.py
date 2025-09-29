from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.unidad_medida import UnidadMedida
from app.schemas.unidad_medida import UnidadMedidaCreate, UnidadMedidaRead

router = APIRouter(prefix="/unidad-medida", tags=["Unidad de medida"])

@router.post("", response_model=UnidadMedidaRead, status_code=201)
def crear(data: UnidadMedidaCreate, db: Session = Depends(get_db)):
    if db.query(UnidadMedida).filter_by(codigo=data.codigo).first():
        raise HTTPException(409, "Código ya existe")
    obj = UnidadMedida(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get("", response_model=list[UnidadMedidaRead])
def listar(db: Session = Depends(get_db)):
    return db.query(UnidadMedida).order_by(UnidadMedida.id_unidad).all()

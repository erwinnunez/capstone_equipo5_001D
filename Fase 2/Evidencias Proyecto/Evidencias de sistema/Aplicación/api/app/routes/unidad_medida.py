from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.unidad_medida import UnidadMedidaCreate, UnidadMedidaUpdate, UnidadMedidaOut
from app.services import unidad_medida as svc

router = APIRouter(prefix="/unidad-medida", tags=["unidad_medida"])

@router.get("", response_model=Page[UnidadMedidaOut])
def list_um(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_unidad}", response_model=UnidadMedidaOut)
def get_um(id_unidad: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_unidad)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=UnidadMedidaOut, status_code=status.HTTP_201_CREATED)
def create_um(payload: UnidadMedidaCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_unidad}", response_model=UnidadMedidaOut)
def update_um(id_unidad: int, payload: UnidadMedidaUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_unidad, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_unidad}")
def delete_um(id_unidad: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_unidad)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

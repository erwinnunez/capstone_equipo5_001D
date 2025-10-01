from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.parametro_clinico import ParametroClinicoCreate, ParametroClinicoUpdate, ParametroClinicoOut
from app.services import parametro_clinico as svc

router = APIRouter(prefix="/parametro-clinico", tags=["parametro_clinico"])

@router.get("", response_model=Page[ParametroClinicoOut])
def list_param(page: int = 1, page_size: int = 20, id_unidad: int | None = Query(None), q: str | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, id_unidad=id_unidad, q=q)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_parametro}", response_model=ParametroClinicoOut)
def get_param(id_parametro: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_parametro)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=ParametroClinicoOut, status_code=status.HTTP_201_CREATED)
def create_param(payload: ParametroClinicoCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_parametro}", response_model=ParametroClinicoOut)
def update_param(id_parametro: int, payload: ParametroClinicoUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_parametro, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_parametro}")
def delete_param(id_parametro: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_parametro)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

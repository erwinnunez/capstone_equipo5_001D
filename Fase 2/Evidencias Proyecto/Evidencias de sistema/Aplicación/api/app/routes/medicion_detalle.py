from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.medicion_detalle import MedicionDetalleCreate, MedicionDetalleUpdate, MedicionDetalleOut
from app.services import medicion_detalle as svc

router = APIRouter(prefix="/medicion-detalle", tags=["medicion_detalle"])

@router.get("", response_model=Page[MedicionDetalleOut])
def list_md(page: int = 1, page_size: int = 20, id_registro: int | None = Query(None), id_parametro: int | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, id_registro=id_registro, id_parametro=id_parametro)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_detalle}", response_model=MedicionDetalleOut)
def get_md(id_detalle: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_detalle)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=MedicionDetalleOut, status_code=status.HTTP_201_CREATED)
def create_md(payload: MedicionDetalleCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_detalle}", response_model=MedicionDetalleOut)
def update_md(id_detalle: int, payload: MedicionDetalleUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_detalle, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_detalle}")
def delete_md(id_detalle: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_detalle)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

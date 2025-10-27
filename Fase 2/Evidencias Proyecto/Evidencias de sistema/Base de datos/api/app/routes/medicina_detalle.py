from fastapi import APIRouter, Depends, HTTPException, Query, status
from datetime import datetime
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.medicina_detalle import (
    MedicinaDetalleCreate,
    MedicinaDetalleUpdate,
    MedicinaDetalleOut,
)
from app.services import medicina_detalle as svc

router = APIRouter(prefix="/medicina-detalle", tags=["medicacion"])

@router.get("", response_model=Page[MedicinaDetalleOut])
def list_mdet(page: int = 1, page_size: int = 20,
              rut_paciente: str | None = Query(None),
              id_medicina: int | None = Query(None),
              desde: datetime | None = Query(None),
              hasta: datetime | None = Query(None),
              tomada: bool | None = Query(None),
              db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size,
                             rut_paciente=rut_paciente, id_medicina=id_medicina,
                             desde=desde, hasta=hasta, tomada=tomada)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_detalle}", response_model=MedicinaDetalleOut)
def get_mdet(id_detalle: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_detalle)
    if not obj:
        raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=MedicinaDetalleOut, status_code=status.HTTP_201_CREATED)
def create_mdet(payload: MedicinaDetalleCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_detalle}", response_model=MedicinaDetalleOut)
def update_mdet(id_detalle: int, payload: MedicinaDetalleUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_detalle, payload)
    if not obj:
        raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_detalle}")
def delete_mdet(id_detalle: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_detalle)
    if not ok:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

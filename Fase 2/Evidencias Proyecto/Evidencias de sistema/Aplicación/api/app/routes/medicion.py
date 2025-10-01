from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.db import get_db
from app.schemas.common import Page
from app.schemas.medicion import MedicionCreate, MedicionUpdate, MedicionOut
from app.services import medicion as svc

router = APIRouter(prefix="/medicion", tags=["medicion"])

@router.get("", response_model=Page[MedicionOut])
def list_mediciones(page: int = 1, page_size: int = 20, rut_paciente: int | None = Query(None), id_parametro: int | None = Query(None), fecha_desde: datetime | None = Query(None), fecha_hasta: datetime | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, rut_paciente=rut_paciente, id_parametro=id_parametro, fecha_desde=fecha_desde, fecha_hasta=fecha_hasta)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_registro}", response_model=MedicionOut)
def get_medicion(id_registro: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_registro)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=MedicionOut, status_code=status.HTTP_201_CREATED)
def create_medicion(payload: MedicionCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_registro}", response_model=MedicionOut)
def update_medicion(id_registro: int, payload: MedicionUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_registro, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_registro}")
def delete_medicion(id_registro: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_registro)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

from fastapi import APIRouter, Depends, HTTPException, Query, status
from datetime import datetime
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.medicion import MedicionCreate, MedicionUpdate, MedicionOut
from app.services import medicion as svc

router = APIRouter(prefix="/medicion", tags=["medicion"])

@router.get("", response_model=Page[MedicionOut])
def list_medicion(page: int = 1, page_size: int = 20,
                  rut_paciente: int | None = Query(None),
                  desde: datetime | None = Query(None),
                  hasta: datetime | None = Query(None),
                  tiene_alerta: bool | None = Query(None),
                  db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size,
                             rut_paciente=rut_paciente, desde=desde, hasta=hasta, tiene_alerta=tiene_alerta)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_medicion}", response_model=MedicionOut)
def get_medicion(id_medicion: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_medicion)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=MedicionOut, status_code=status.HTTP_201_CREATED)
def create_medicion(payload: MedicionCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_medicion}", response_model=MedicionOut)
def update_medicion(id_medicion: int, payload: MedicionUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_medicion, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_medicion}")
def delete_medicion(id_medicion: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_medicion)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

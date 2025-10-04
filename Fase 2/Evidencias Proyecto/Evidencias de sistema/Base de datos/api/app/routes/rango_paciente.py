from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.rango_paciente import RangoPacienteCreate, RangoPacienteUpdate, RangoPacienteOut
from app.services import rango_paciente as svc

router = APIRouter(prefix="/rango-paciente", tags=["parametros"])

@router.get("", response_model=Page[RangoPacienteOut])
def list_rango(page: int = 1, page_size: int = 20,
               rut_paciente: int | None = Query(None),
               id_parametro: int | None = Query(None),
               db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, rut_paciente=rut_paciente, id_parametro=id_parametro)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_rango}", response_model=RangoPacienteOut)
def get_rango(id_rango: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_rango)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=RangoPacienteOut, status_code=status.HTTP_201_CREATED)
def create_rango(payload: RangoPacienteCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_rango}", response_model=RangoPacienteOut)
def update_rango(id_rango: int, payload: RangoPacienteUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_rango, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_rango}")
def delete_rango(id_rango: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_rango)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

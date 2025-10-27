from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.medico_historial import MedicoHistorialCreate, MedicoHistorialOut
from app.services import medico_historial as svc

router = APIRouter(prefix="/medico-historial", tags=["historial"])

@router.get("", response_model=Page[MedicoHistorialOut])
def list_mh(page: int = 1, page_size: int = 20, rut_medico: str | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, rut_medico=rut_medico)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{historial_id}", response_model=MedicoHistorialOut)
def get_mh(historial_id: int, db: Session = Depends(get_db)):
    obj = svc.get(db, historial_id)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=MedicoHistorialOut, status_code=status.HTTP_201_CREATED)
def create_mh(payload: MedicoHistorialCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.delete("/{historial_id}")
def delete_mh(historial_id: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, historial_id)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

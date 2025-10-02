from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.paciente_historial import PacienteHistorialCreate, PacienteHistorialOut
from app.services import paciente_historial as svc

router = APIRouter(prefix="/paciente-historial", tags=["historial"])

@router.get("", response_model=Page[PacienteHistorialOut])
def list_ph(page: int = 1, page_size: int = 20, rut_paciente: int | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, rut_paciente=rut_paciente)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{historial_id}", response_model=PacienteHistorialOut)
def get_ph(historial_id: int, db: Session = Depends(get_db)):
    obj = svc.get(db, historial_id)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=PacienteHistorialOut, status_code=status.HTTP_201_CREATED)
def create_ph(payload: PacienteHistorialCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.delete("/{historial_id}")
def delete_ph(historial_id: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, historial_id)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

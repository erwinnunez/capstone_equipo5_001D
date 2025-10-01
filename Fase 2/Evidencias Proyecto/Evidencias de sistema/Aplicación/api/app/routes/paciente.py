from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.paciente import PacienteCreate, PacienteUpdate, PacienteOut
from app.services import paciente as svc

router = APIRouter(prefix="/paciente", tags=["paciente"])

@router.get("", response_model=Page[PacienteOut])
def list_pacientes(page: int = 1, page_size: int = 20, estado: bool | None = Query(None), q: str | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, estado=estado, q=q)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{rut_paciente}", response_model=PacienteOut)
def get_paciente(rut_paciente: int, db: Session = Depends(get_db)):
    obj = svc.get(db, rut_paciente)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=PacienteOut, status_code=status.HTTP_201_CREATED)
def create_paciente(payload: PacienteCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{rut_paciente}", response_model=PacienteOut)
def update_paciente(rut_paciente: int, payload: PacienteUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, rut_paciente, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{rut_paciente}")
def delete_paciente(rut_paciente: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, rut_paciente)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

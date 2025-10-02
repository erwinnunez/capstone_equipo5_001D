from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.paciente_cuidador import PacienteCuidadorCreate, PacienteCuidadorUpdate, PacienteCuidadorOut
from app.services import paciente_cuidador as svc

router = APIRouter(prefix="/paciente-cuidador", tags=["paciente_cuidador"])

@router.get("", response_model=Page[PacienteCuidadorOut])
def list_pc(page: int = 1, page_size: int = 20,
            rut_paciente: int | None = Query(None),
            rut_cuidador: int | None = Query(None),
            activo: bool | None = Query(None),
            db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size,
                             rut_paciente=rut_paciente, rut_cuidador=rut_cuidador, activo=activo)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{rut_paciente}/{rut_cuidador}", response_model=PacienteCuidadorOut)
def get_pc(rut_paciente: int, rut_cuidador: int, db: Session = Depends(get_db)):
    obj = svc.get(db, rut_paciente, rut_cuidador)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=PacienteCuidadorOut, status_code=status.HTTP_201_CREATED)
def create_pc(payload: PacienteCuidadorCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{rut_paciente}/{rut_cuidador}", response_model=PacienteCuidadorOut)
def update_pc(rut_paciente: int, rut_cuidador: int, payload: PacienteCuidadorUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, rut_paciente, rut_cuidador, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{rut_paciente}/{rut_cuidador}")
def delete_pc(rut_paciente: int, rut_cuidador: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, rut_paciente, rut_cuidador)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.equipo_medico import EquipoMedicoCreate, EquipoMedicoUpdate, EquipoMedicoOut
from app.services import equipo_medico as svc

router = APIRouter(prefix="/equipo-medico", tags=["equipo_medico"])

@router.get("", response_model=Page[EquipoMedicoOut])
def list_equipo(page: int = 1, page_size: int = 20, id_cesfam: int | None = Query(None), estado: bool | None = Query(None), q: str | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, id_cesfam=id_cesfam, estado=estado, q=q)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{rut_medico}", response_model=EquipoMedicoOut)
def get_equipo(rut_medico: int, db: Session = Depends(get_db)):
    obj = svc.get(db, rut_medico)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=EquipoMedicoOut, status_code=status.HTTP_201_CREATED)
def create_equipo(payload: EquipoMedicoCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{rut_medico}", response_model=EquipoMedicoOut)
def update_equipo(rut_medico: int, payload: EquipoMedicoUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, rut_medico, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{rut_medico}")
def delete_equipo(rut_medico: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, rut_medico)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

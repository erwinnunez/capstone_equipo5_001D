from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.gamificacion_perfil import GamificacionPerfilCreate, GamificacionPerfilUpdate, GamificacionPerfilOut
from app.services import gamificacion_perfil as svc

router = APIRouter(prefix="/gamificacion-perfil", tags=["gamificacion"])

@router.get("", response_model=Page[GamificacionPerfilOut])
def list_gp(page: int = 1, page_size: int = 20, rut_paciente: str | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, rut_paciente=rut_paciente)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{rut_paciente}", response_model=GamificacionPerfilOut)
def get_gp(rut_paciente: str, db: Session = Depends(get_db)):
    obj = svc.get(db, rut_paciente)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=GamificacionPerfilOut, status_code=status.HTTP_201_CREATED)
def create_gp(payload: GamificacionPerfilCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{rut_paciente}", response_model=GamificacionPerfilOut)
def update_gp(rut_paciente: str, payload: GamificacionPerfilUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, rut_paciente, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{rut_paciente}")
def delete_gp(rut_paciente: str, db: Session = Depends(get_db)):
    ok = svc.delete(db, rut_paciente)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

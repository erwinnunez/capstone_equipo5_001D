# app/routes/equipo_medico.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.equipo_medico import EquipoMedicoCreate, EquipoMedicoUpdate, EquipoMedicoOut, EquipoMedicoSetEstado
from app.services import equipo_medico as svc

router = APIRouter(prefix="/equipo-medico", tags=["equipo_medico"])

@router.get("", response_model=Page[EquipoMedicoOut])
def list_medicos(page: int = 1, page_size: int = 20,
                 id_cesfam: int | None = Query(None),
                 estado: bool | None = Query(True),
                 primer_nombre: str | None = Query(None),
                 segundo_nombre: str | None = Query(None),
                 primer_apellido: str | None = Query(None),
                 segundo_apellido: str | None = Query(None),
                 is_admin: bool | None = Query(None),
                 db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size,
                             id_cesfam=id_cesfam, estado=estado,
                             primer_nombre=primer_nombre, segundo_nombre=segundo_nombre,
                             primer_apellido=primer_apellido, segundo_apellido=segundo_apellido,
                             is_admin=is_admin)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{rut_medico}", response_model=EquipoMedicoOut)
def get_medico(rut_medico: str, db: Session = Depends(get_db)):
    obj = svc.get(db, rut_medico)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=EquipoMedicoOut, status_code=status.HTTP_201_CREATED)
def create_medico(payload: EquipoMedicoCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{rut_medico}", response_model=EquipoMedicoOut)
def update_medico(rut_medico: str, payload: EquipoMedicoUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, rut_medico, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("/{rut_medico}/estado")
def set_estado_medico(rut_medico: str, payload: EquipoMedicoSetEstado, db: Session = Depends(get_db)):
    ok = svc.set_estado(db, rut_medico, payload.habilitar)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "OK", "habilitado": payload.habilitar}

@router.delete("/{rut_medico}")
def delete_medico(rut_medico: str, db: Session = Depends(get_db)):
    ok = svc.delete(db, rut_medico)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Disabled"}

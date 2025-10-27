from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.cuidador import CuidadorCreate, CuidadorUpdate, CuidadorOut, CuidadorSetEstado
from app.services import cuidador as svc

router = APIRouter(prefix="/cuidador", tags=["cuidador"])

@router.get("", response_model=Page[CuidadorOut])
def list_cuidadores(page: int = 1, page_size: int = 20,
                    estado: bool | None = Query(True),
                    primer_nombre: str | None = Query(None),
                    segundo_nombre: str | None = Query(None),
                    primer_apellido: str | None = Query(None),
                    segundo_apellido: str | None = Query(None),
                    db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size,
                             estado=estado, primer_nombre=primer_nombre, segundo_nombre=segundo_nombre,
                             primer_apellido=primer_apellido, segundo_apellido=segundo_apellido)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{rut_cuidador}", response_model=CuidadorOut)
def get_cuidador(rut_cuidador: str, db: Session = Depends(get_db)):
    obj = svc.get(db, rut_cuidador)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=CuidadorOut, status_code=status.HTTP_201_CREATED)
def create_cuidador(payload: CuidadorCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{rut_cuidador}", response_model=CuidadorOut)
def update_cuidador(rut_cuidador: str, payload: CuidadorUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, rut_cuidador, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("/{rut_cuidador}/estado")
def set_estado_cuidador(rut_cuidador: str, payload: CuidadorSetEstado, db: Session = Depends(get_db)):
    ok = svc.set_estado(db, rut_cuidador, payload.habilitar)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "OK", "habilitado": payload.habilitar}

@router.delete("/{rut_cuidador}")
def delete_cuidador(rut_cuidador: str, db: Session = Depends(get_db)):
    ok = svc.delete(db, rut_cuidador)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Disabled"}

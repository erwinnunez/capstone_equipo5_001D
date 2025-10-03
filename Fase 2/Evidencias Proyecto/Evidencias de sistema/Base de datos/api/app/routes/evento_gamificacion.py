from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.evento_gamificacion import EventoGamificacionCreate, EventoGamificacionOut
from app.services import evento_gamificacion as svc

router = APIRouter(prefix="/evento-gamificacion", tags=["gamificacion"])

@router.get("", response_model=Page[EventoGamificacionOut])
def list_ev(page: int = 1, page_size: int = 20,
            rut_paciente: int | None = Query(None),
            tipo: str | None = Query(None),
            db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, rut_paciente=rut_paciente, tipo=tipo)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_evento}", response_model=EventoGamificacionOut)
def get_ev(id_evento: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_evento)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=EventoGamificacionOut, status_code=status.HTTP_201_CREATED)
def create_ev(payload: EventoGamificacionCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.delete("/{id_evento}")
def delete_ev(id_evento: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_evento)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

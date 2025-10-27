from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.usuario_insignia import UsuarioInsigniaCreate, UsuarioInsigniaOut
from app.services import usuario_insignia as svc

router = APIRouter(prefix="/usuario-insignia", tags=["insignia"])

@router.get("", response_model=Page[UsuarioInsigniaOut])
def list_ui(page: int = 1, page_size: int = 20,
            rut_paciente: str | None = Query(None),
            id_insignia: int | None = Query(None),
            db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size,
                             rut_paciente=rut_paciente, id_insignia=id_insignia)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{rut_paciente}/{id_insignia}", response_model=UsuarioInsigniaOut)
def get_ui(rut_paciente: str, id_insignia: int, db: Session = Depends(get_db)):
    obj = svc.get(db, rut_paciente, id_insignia)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=UsuarioInsigniaOut, status_code=status.HTTP_201_CREATED)
def create_ui(payload: UsuarioInsigniaCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.delete("/{rut_paciente}/{id_insignia}")
def delete_ui(rut_paciente: str, id_insignia: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, rut_paciente, id_insignia)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.nota_clinica import NotaClinicaCreate, NotaClinicaUpdate, NotaClinicaOut
from app.services import nota_clinica as svc

router = APIRouter(prefix="/nota-clinica", tags=["nota_clinica"])

@router.get("", response_model=Page[NotaClinicaOut])
def list_notas(page: int = 1, page_size: int = 20, rut_paciente: int | None = Query(None), rut_medico: int | None = Query(None), id_cesfam: int | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, rut_paciente=rut_paciente, rut_medico=rut_medico, id_cesfam=id_cesfam)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_nota}", response_model=NotaClinicaOut)
def get_nota(id_nota: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_nota)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=NotaClinicaOut, status_code=status.HTTP_201_CREATED)
def create_nota(payload: NotaClinicaCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_nota}", response_model=NotaClinicaOut)
def update_nota(id_nota: int, payload: NotaClinicaUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_nota, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_nota}")
def delete_nota(id_nota: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_nota)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

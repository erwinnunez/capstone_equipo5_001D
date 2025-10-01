from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.paciente_cesfam import PacienteCesfamCreate, PacienteCesfamUpdate, PacienteCesfamOut
from app.services import paciente_cesfam as svc

router = APIRouter(prefix="/paciente-cesfam", tags=["paciente_cesfam"])

@router.get("", response_model=Page[PacienteCesfamOut])
def list_pc(page: int = 1, page_size: int = 20, rut_paciente: int | None = Query(None), id_cesfam: int | None = Query(None), activo: bool | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, rut_paciente=rut_paciente, id_cesfam=id_cesfam, activo=activo)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_pc}", response_model=PacienteCesfamOut)
def get_pc(id_pc: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_pc)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=PacienteCesfamOut, status_code=status.HTTP_201_CREATED)
def create_pc(payload: PacienteCesfamCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_pc}", response_model=PacienteCesfamOut)
def update_pc(id_pc: int, payload: PacienteCesfamUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_pc, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_pc}")
def delete_pc(id_pc: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_pc)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

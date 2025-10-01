from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.cesfam import CesfamCreate, CesfamUpdate, CesfamOut
from app.services import cesfam as svc

router = APIRouter(prefix="/cesfam", tags=["cesfam"])

@router.get("", response_model=Page[CesfamOut])
def list_cesfam(page: int = 1, page_size: int = 20, id_comuna: int | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, id_comuna=id_comuna)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_cesfam}", response_model=CesfamOut)
def get_cesfam(id_cesfam: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_cesfam)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=CesfamOut, status_code=status.HTTP_201_CREATED)
def create_cesfam(payload: CesfamCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_cesfam}", response_model=CesfamOut)
def update_cesfam(id_cesfam: int, payload: CesfamUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_cesfam, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_cesfam}")
def delete_cesfam(id_cesfam: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_cesfam)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

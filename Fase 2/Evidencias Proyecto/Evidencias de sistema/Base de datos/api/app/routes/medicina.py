from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.medicina import MedicinaCreate, MedicinaUpdate, MedicinaOut
from app.services import medicina as svc

router = APIRouter(prefix="/medicina", tags=["medicacion"])

@router.get("", response_model=Page[MedicinaOut])
def list_meds(page: int = 1, page_size: int = 20,
              id_unidad: int | None = Query(None),
              q: str | None = Query(None),
              db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, id_unidad=id_unidad, q=q)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_medicina}", response_model=MedicinaOut)
def get_med(id_medicina: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_medicina)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=MedicinaOut, status_code=status.HTTP_201_CREATED)
def create_med(payload: MedicinaCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_medicina}", response_model=MedicinaOut)
def update_med(id_medicina: int, payload: MedicinaUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_medicina, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_medicina}")
def delete_med(id_medicina: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_medicina)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

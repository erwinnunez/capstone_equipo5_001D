from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.comuna import ComunaCreate, ComunaUpdate, ComunaOut
from app.services import comuna as svc

router = APIRouter(prefix="/comuna", tags=["comuna"])

@router.get("", response_model=Page[ComunaOut])
def list_comuna(page: int = 1, page_size: int = 20, id_region: int | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, id_region=id_region)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_comuna}", response_model=ComunaOut)
def get_comuna(id_comuna: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_comuna)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=ComunaOut, status_code=status.HTTP_201_CREATED)
def create_comuna(payload: ComunaCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_comuna}", response_model=ComunaOut)
def update_comuna(id_comuna: int, payload: ComunaUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_comuna, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_comuna}")
def delete_comuna(id_comuna: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_comuna)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

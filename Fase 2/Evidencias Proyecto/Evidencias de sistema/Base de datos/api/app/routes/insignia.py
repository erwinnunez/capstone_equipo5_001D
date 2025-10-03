from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.insignia import InsigniaCreate, InsigniaUpdate, InsigniaOut
from app.services import insignia as svc

router = APIRouter(prefix="/insignia", tags=["insignia"])

@router.get("", response_model=Page[InsigniaOut])
def list_insignia(page: int = 1, page_size: int = 20, codigo: int | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, codigo=codigo)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_insignia}", response_model=InsigniaOut)
def get_insignia(id_insignia: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_insignia)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=InsigniaOut, status_code=status.HTTP_201_CREATED)
def create_insignia(payload: InsigniaCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_insignia}", response_model=InsigniaOut)
def update_insignia(id_insignia: int, payload: InsigniaUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_insignia, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_insignia}")
def delete_insignia(id_insignia: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_insignia)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.region import RegionCreate, RegionUpdate, RegionOut
from app.services import region as svc

router = APIRouter(prefix="/region", tags=["region"])

@router.get("", response_model=Page[RegionOut])
def list_region(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_region}", response_model=RegionOut)
def get_region(id_region: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_region)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=RegionOut, status_code=status.HTTP_201_CREATED)
def create_region(payload: RegionCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_region}", response_model=RegionOut)
def update_region(id_region: int, payload: RegionUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_region, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_region}")
def delete_region(id_region: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_region)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

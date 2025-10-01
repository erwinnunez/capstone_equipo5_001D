from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.descarga_reporte import DescargaReporteCreate, DescargaReporteOut
from app.services import descarga_reporte as svc

router = APIRouter(prefix="/descarga-reporte", tags=["reportes"])

@router.get("", response_model=Page[DescargaReporteOut])
def list_dr(page: int = 1, page_size: int = 20, rut_medico: int | None = Query(None), id_reporte: int | None = Query(None), db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size, rut_medico=rut_medico, id_reporte=id_reporte)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_descarga}", response_model=DescargaReporteOut)
def get_dr(id_descarga: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_descarga)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=DescargaReporteOut, status_code=status.HTTP_201_CREATED)
def create_dr(payload: DescargaReporteCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.delete("/{id_descarga}")
def delete_dr(id_descarga: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_descarga)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

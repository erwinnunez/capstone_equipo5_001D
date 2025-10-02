from fastapi import APIRouter, Depends, HTTPException, Query, status
from datetime import datetime
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.solicitud_reporte import SolicitudReporteCreate, SolicitudReporteUpdate, SolicitudReporteOut
from app.services import solicitud_reporte as svc

router = APIRouter(prefix="/solicitud-reporte", tags=["reportes"])

@router.get("", response_model=Page[SolicitudReporteOut])
def list_sr(page: int = 1, page_size: int = 20,
            rut_medico: int | None = Query(None),
            rut_paciente: int | None = Query(None),
            estado: str | None = Query(None),
            desde: datetime | None = Query(None),
            hasta: datetime | None = Query(None),
            db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size,
                             rut_medico=rut_medico, rut_paciente=rut_paciente,
                             estado=estado, desde=desde, hasta=hasta)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_reporte}", response_model=SolicitudReporteOut)
def get_sr(id_reporte: int, db: Session = Depends(get_db)):
    obj = svc.get(db, id_reporte)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=SolicitudReporteOut, status_code=status.HTTP_201_CREATED)
def create_sr(payload: SolicitudReporteCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{id_reporte}", response_model=SolicitudReporteOut)
def update_sr(id_reporte: int, payload: SolicitudReporteUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, id_reporte, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id_reporte}")
def delete_sr(id_reporte: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, id_reporte)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

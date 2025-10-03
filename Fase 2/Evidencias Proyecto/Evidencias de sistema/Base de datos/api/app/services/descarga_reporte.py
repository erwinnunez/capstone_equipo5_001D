from sqlalchemy.orm import Session
from datetime import datetime
from app.models.descarga_reporte import DescargaReporte
from app.schemas.descarga_reporte import DescargaReporteCreate

def list_(db: Session, skip: int, limit: int, rut_medico: int | None = None, id_reporte: int | None = None,
          desde: datetime | None = None, hasta: datetime | None = None):
    q = db.query(DescargaReporte)
    if rut_medico is not None:
        q = q.filter(DescargaReporte.rut_medico == rut_medico)
    if id_reporte is not None:
        q = q.filter(DescargaReporte.id_reporte == id_reporte)
    if desde:
        q = q.filter(DescargaReporte.descargado_en >= desde)
    if hasta:
        q = q.filter(DescargaReporte.descargado_en < hasta)
    total = q.count()
    items = q.order_by(DescargaReporte.descargado_en.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_descarga: int):
    return db.get(DescargaReporte, id_descarga)

def create(db: Session, data: DescargaReporteCreate):
    obj = DescargaReporte(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_descarga: int):
    obj = get(db, id_descarga)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

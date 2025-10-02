from sqlalchemy.orm import Session
from datetime import datetime
from app.models.solicitud_reporte import SolicitudReporte
from app.schemas.solicitud_reporte import SolicitudReporteCreate, SolicitudReporteUpdate

def list_(db: Session, skip: int, limit: int,
          rut_medico: int | None = None,
          rut_paciente: int | None = None,
          estado: str | None = None,
          desde: datetime | None = None,
          hasta: datetime | None = None):
    q = db.query(SolicitudReporte)
    if rut_medico is not None:
        q = q.filter(SolicitudReporte.rut_medico == rut_medico)
    if rut_paciente is not None:
        q = q.filter(SolicitudReporte.rut_paciente == rut_paciente)
    if estado:
        q = q.filter(SolicitudReporte.estado == estado)
    if desde:
        q = q.filter(SolicitudReporte.creado_en >= desde)
    if hasta:
        q = q.filter(SolicitudReporte.creado_en < hasta)
    total = q.count()
    items = q.order_by(SolicitudReporte.creado_en.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_reporte: int):
    return db.get(SolicitudReporte, id_reporte)

def create(db: Session, data: SolicitudReporteCreate):
    obj = SolicitudReporte(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_reporte: int, data: SolicitudReporteUpdate):
    obj = get(db, id_reporte)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_reporte: int):
    obj = get(db, id_reporte)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

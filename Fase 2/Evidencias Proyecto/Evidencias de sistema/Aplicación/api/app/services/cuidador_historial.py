from sqlalchemy.orm import Session
from app.models.cuidador_historial import CuidadorHistorial
from app.schemas.cuidador_historial import CuidadorHistorialCreate

def list_(db: Session, skip: int, limit: int, rut_cuidador: int | None = None):
    q = db.query(CuidadorHistorial)
    if rut_cuidador is not None:
        q = q.filter(CuidadorHistorial.rut_cuidador == rut_cuidador)
    total = q.count()
    items = q.order_by(CuidadorHistorial.historial_id.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, historial_id: int):
    return db.get(CuidadorHistorial, historial_id)

def create(db: Session, data: CuidadorHistorialCreate):
    obj = CuidadorHistorial(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, historial_id: int):
    obj = get(db, historial_id)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

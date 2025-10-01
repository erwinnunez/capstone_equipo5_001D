from sqlalchemy.orm import Session
from app.models.medico_historial import MedicoHistorial
from app.schemas.medico_historial import MedicoHistorialCreate

def list_(db: Session, skip: int, limit: int, rut_medico: int | None = None):
    q = db.query(MedicoHistorial)
    if rut_medico is not None:
        q = q.filter(MedicoHistorial.rut_medico == rut_medico)
    total = q.count()
    items = q.order_by(MedicoHistorial.fecha_cambio.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, historial_id: int):
    return db.get(MedicoHistorial, historial_id)

def create(db: Session, data: MedicoHistorialCreate):
    obj = MedicoHistorial(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, historial_id: int):
    obj = get(db, historial_id)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

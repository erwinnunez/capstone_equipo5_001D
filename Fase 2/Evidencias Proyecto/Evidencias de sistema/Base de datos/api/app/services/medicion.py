from sqlalchemy.orm import Session
from datetime import datetime
from app.models.medicion import Medicion
from app.schemas.medicion import MedicionCreate, MedicionUpdate

def list_(db: Session, skip: int, limit: int,
          rut_paciente: int | None = None,
          desde: datetime | None = None,
          hasta: datetime | None = None,
          tiene_alerta: bool | None = None):
    q = db.query(Medicion)
    if rut_paciente is not None:
        q = q.filter(Medicion.rut_paciente == rut_paciente)
    if desde:
        q = q.filter(Medicion.fecha_registro >= desde)
    if hasta:
        q = q.filter(Medicion.fecha_registro < hasta)
    if tiene_alerta is not None:
        q = q.filter(Medicion.tiene_alerta == tiene_alerta)
    total = q.count()
    items = q.order_by(Medicion.fecha_registro.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_medicion: int):
    return db.get(Medicion, id_medicion)

def create(db: Session, data: MedicionCreate):
    obj = Medicion(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_medicion: int, data: MedicionUpdate):
    obj = get(db, id_medicion)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_medicion: int):
    obj = get(db, id_medicion)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

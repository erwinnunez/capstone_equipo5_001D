from datetime import datetime
from sqlalchemy.orm import Session
from app.models.medicion import Medicion
from app.models.medicion_detalle import MedicionDetalle
from app.schemas.medicion import MedicionCreate, MedicionUpdate

def list_(db: Session, skip: int, limit: int,
          rut_paciente: int | None = None,
          id_parametro: int | None = None,
          fecha_desde: datetime | None = None,
          fecha_hasta: datetime | None = None):
    q = db.query(Medicion)
    if rut_paciente is not None:
        q = q.filter(Medicion.rut_paciente == rut_paciente)
    if id_parametro is not None:
        q = q.filter(Medicion.id_parametro == id_parametro)
    if fecha_desde is not None:
        q = q.filter(Medicion.fecha_lectura >= fecha_desde)
    if fecha_hasta is not None:
        q = q.filter(Medicion.fecha_lectura < fecha_hasta)
    total = q.count()
    items = q.order_by(Medicion.fecha_lectura.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_registro: int):
    return db.get(Medicion, id_registro)

def create(db: Session, data: MedicionCreate):
    obj = Medicion(**data.model_dump(exclude={"detalles"}))
    db.add(obj)
    db.flush()
    for d in data.detalles:
        db.add(MedicionDetalle(id_registro=obj.id_registro, **d.model_dump()))
    db.commit()
    db.refresh(obj)
    return obj

def update(db: Session, id_registro: int, data: MedicionUpdate):
    obj = get(db, id_registro)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_registro: int):
    obj = get(db, id_registro)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

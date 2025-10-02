from sqlalchemy.orm import Session
from app.models.medicion_detalle import MedicionDetalle
from app.schemas.medicion_detalle import MedicionDetalleCreate, MedicionDetalleUpdate

def list_(db: Session, skip: int, limit: int, id_medicion: int | None = None, id_parametro: int | None = None):
    q = db.query(MedicionDetalle)
    if id_medicion is not None:
        q = q.filter(MedicionDetalle.id_medicion == id_medicion)
    if id_parametro is not None:
        q = q.filter(MedicionDetalle.id_parametro == id_parametro)
    total = q.count()
    items = q.order_by(MedicionDetalle.id_detalle).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_detalle: int):
    return db.get(MedicionDetalle, id_detalle)

def create(db: Session, data: MedicionDetalleCreate):
    obj = MedicionDetalle(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_detalle: int, data: MedicionDetalleUpdate):
    obj = get(db, id_detalle)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_detalle: int):
    obj = get(db, id_detalle)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

from sqlalchemy.orm import Session
from app.models.medicina import Medicina
from app.schemas.medicina import MedicinaCreate, MedicinaUpdate

def list_(db: Session, skip: int, limit: int, id_unidad: int | None = None, q: str | None = None):
    qy = db.query(Medicina)
    if id_unidad is not None:
        qy = qy.filter(Medicina.id_unidad == id_unidad)
    if q:
        qy = qy.filter(Medicina.nombre.ilike(f"%{q}%"))
    total = qy.count()
    items = qy.order_by(Medicina.id_medicina).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_medicina: int):
    return db.get(Medicina, id_medicina)

def create(db: Session, data: MedicinaCreate):
    obj = Medicina(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_medicina: int, data: MedicinaUpdate):
    obj = get(db, id_medicina)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_medicina: int):
    obj = get(db, id_medicina)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

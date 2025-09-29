from sqlalchemy.orm import Session
from app.models.comuna import Comuna
from app.schemas.comuna import ComunaCreate, ComunaUpdate

def list_(db: Session, skip: int, limit: int, id_region: int | None = None):
    q = db.query(Comuna)
    if id_region is not None:
        q = q.filter(Comuna.id_region == id_region)
    total = q.count()
    items = q.offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_comuna: int):
    return db.get(Comuna, id_comuna)

def create(db: Session, data: ComunaCreate):
    obj = Comuna(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_comuna: int, data: ComunaUpdate):
    obj = get(db, id_comuna)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_comuna: int):
    obj = get(db, id_comuna)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

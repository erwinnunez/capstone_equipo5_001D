from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.insignia import Insignia
from app.schemas.insignia import InsigniaCreate, InsigniaUpdate

def list_(db: Session, skip: int, limit: int, q: str | None = None):
    query = db.query(Insignia)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (Insignia.codigo.ilike(like)) |
            (Insignia.nombre_insignia.ilike(like))
        )
    total = query.count()
    items = query.order_by(Insignia.id_insignia).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_insignia: int):
    return db.get(Insignia, id_insignia)

def get_by_codigo(db: Session, codigo: str):
    return db.query(Insignia).filter(func.lower(Insignia.codigo) == codigo.lower()).first()

def create(db: Session, data: InsigniaCreate):
    obj = Insignia(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_insignia: int, data: InsigniaUpdate):
    obj = get(db, id_insignia)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_insignia: int):
    obj = get(db, id_insignia)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

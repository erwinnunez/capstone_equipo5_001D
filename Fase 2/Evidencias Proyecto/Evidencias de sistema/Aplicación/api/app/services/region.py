from sqlalchemy.orm import Session
from app.models.region import Region
from app.schemas.region import RegionCreate, RegionUpdate

def list_(db: Session, skip: int, limit: int):
    q = db.query(Region)
    total = q.count()
    items = q.offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_region: int):
    return db.get(Region, id_region)

def create(db: Session, data: RegionCreate):
    obj = Region(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_region: int, data: RegionUpdate):
    obj = get(db, id_region)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_region: int):
    obj = get(db, id_region)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

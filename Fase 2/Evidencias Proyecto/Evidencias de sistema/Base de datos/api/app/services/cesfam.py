from sqlalchemy.orm import Session
from app.models.cesfam import Cesfam
from app.schemas.cesfam import CesfamCreate, CesfamUpdate

def list_(db: Session, skip: int, limit: int, id_comuna: int | None = None, estado: bool | None = True):
    q = db.query(Cesfam)
    if id_comuna is not None:
        q = q.filter(Cesfam.id_comuna == id_comuna)
    if estado is not None:
        q = q.filter(Cesfam.estado == estado)
    total = q.count()
    items = q.order_by(Cesfam.id_cesfam).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_cesfam: int):
    return db.get(Cesfam, id_cesfam)

def create(db: Session, data: CesfamCreate):
    obj = Cesfam(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_cesfam: int, data: CesfamUpdate):
    obj = get(db, id_cesfam)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def set_estado(db: Session, id_cesfam: int, habilitar: bool) -> bool:
    obj = get(db, id_cesfam)
    if not obj: return False
    obj.estado = habilitar
    db.commit(); db.refresh(obj)
    return True

def delete(db: Session, id_cesfam: int) -> bool:
    return set_estado(db, id_cesfam, False)

from sqlalchemy.orm import Session
from app.models.unidad_medida import UnidadMedida
from app.schemas.unidad_medida import UnidadMedidaCreate, UnidadMedidaUpdate

def list_(db: Session, skip: int, limit: int):
    q = db.query(UnidadMedida)
    total = q.count()
    items = q.order_by(UnidadMedida.id_unidad).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_unidad: int):
    return db.get(UnidadMedida, id_unidad)

def create(db: Session, data: UnidadMedidaCreate):
    obj = UnidadMedida(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_unidad: int, data: UnidadMedidaUpdate):
    obj = get(db, id_unidad)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_unidad: int):
    obj = get(db, id_unidad)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

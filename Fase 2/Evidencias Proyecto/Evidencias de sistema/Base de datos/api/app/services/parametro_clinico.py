from sqlalchemy.orm import Session
from app.models.parametro_clinico import ParametroClinico
from app.schemas.parametro_clinico import ParametroClinicoCreate, ParametroClinicoUpdate

def list_(db: Session, skip: int, limit: int, id_unidad: int | None = None, codigo: str | None = None):
    q = db.query(ParametroClinico)
    if id_unidad is not None:
        q = q.filter(ParametroClinico.id_unidad == id_unidad)
    if codigo:
        q = q.filter(ParametroClinico.codigo == codigo)
    total = q.count()
    items = q.order_by(ParametroClinico.id_parametro).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_parametro: int):
    return db.get(ParametroClinico, id_parametro)

def create(db: Session, data: ParametroClinicoCreate):
    obj = ParametroClinico(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_parametro: int, data: ParametroClinicoUpdate):
    obj = get(db, id_parametro)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_parametro: int):
    obj = get(db, id_parametro)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

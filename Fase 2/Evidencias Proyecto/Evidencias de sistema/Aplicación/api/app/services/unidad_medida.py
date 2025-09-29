from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.unidad_medida import UnidadMedida
from app.schemas.unidad_medida import UnidadMedidaCreate

def list_(db: Session, skip: int, limit: int, q: str | None = None):
    query = db.query(UnidadMedida)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (UnidadMedida.codigo.ilike(like)) |
            (UnidadMedida.descripcion.ilike(like))
        )
    total = query.count()
    items = query.order_by(UnidadMedida.id_unidad).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_unidad: int):
    return db.get(UnidadMedida, id_unidad)

def get_by_codigo(db: Session, codigo: str):
    return db.query(UnidadMedida).filter(
        func.lower(UnidadMedida.codigo) == codigo.lower()
    ).first()

def create(db: Session, data: UnidadMedidaCreate):
    obj = UnidadMedida(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

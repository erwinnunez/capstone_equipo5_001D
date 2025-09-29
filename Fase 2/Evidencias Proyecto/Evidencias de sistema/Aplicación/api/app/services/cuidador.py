from sqlalchemy.orm import Session
from app.models.cuidador import Cuidador
from app.schemas.cuidador import CuidadorCreate

def list_(
    db: Session, skip: int, limit: int,
    estado: bool | None = None,
    q: str | None = None
):
    query = db.query(Cuidador)
    if estado is not None:
        query = query.filter(Cuidador.estado == estado)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (Cuidador.nombre_cuidador.ilike(like)) |
            (Cuidador.apellido_cuidador.ilike(like)) |
            (Cuidador.email.ilike(like)) |
            (Cuidador.telefono.ilike(like))
        )
    total = query.count()
    items = query.order_by(Cuidador.rut_cuidador).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, rut_cuidador: int):
    return db.get(Cuidador, rut_cuidador)

def create(db: Session, data: CuidadorCreate):
    obj = Cuidador(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

from sqlalchemy.orm import Session
from app.models.parametro_clinico import ParametroClinico
from app.schemas.parametro_clinico import ParametroClinicoCreate

def list_(
    db: Session, skip: int, limit: int,
    id_unidad: int | None = None,
    activo: bool | None = None,
    q: str | None = None
):
    query = db.query(ParametroClinico)
    if id_unidad is not None:
        query = query.filter(ParametroClinico.id_unidad == id_unidad)
    if activo is not None:
        query = query.filter(ParametroClinico.activo == activo)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (ParametroClinico.codigo.ilike(like)) |
            (ParametroClinico.descripcion.ilike(like))
        )
    total = query.count()
    items = query.order_by(ParametroClinico.id_parametro).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_parametro: int):
    return db.get(ParametroClinico, id_parametro)

def get_by_codigo(db: Session, codigo: str):
    return db.query(ParametroClinico).filter(
        ParametroClinico.codigo.ilike(codigo)
    ).first()

def create(db: Session, data: ParametroClinicoCreate):
    obj = ParametroClinico(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

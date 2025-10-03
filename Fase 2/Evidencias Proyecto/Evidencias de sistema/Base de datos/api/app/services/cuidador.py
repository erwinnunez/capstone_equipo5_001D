from sqlalchemy.orm import Session
from app.models.cuidador import Cuidador
from app.schemas.cuidador import CuidadorCreate, CuidadorUpdate

def list_(db: Session, skip: int, limit: int,
          estado: bool | None = True,
          primer_nombre: str | None = None,
          segundo_nombre: str | None = None,
          primer_apellido: str | None = None,
          segundo_apellido: str | None = None):
    q = db.query(Cuidador)
    if estado is not None:
        q = q.filter(Cuidador.estado == estado)

    def ilike(col, txt): return col.ilike(f"%{txt}%")
    if primer_nombre:
        q = q.filter(ilike(Cuidador.primer_nombre_cuidador, primer_nombre))
    if segundo_nombre:
        q = q.filter(ilike(Cuidador.segundo_nombre_cuidador, segundo_nombre))
    if primer_apellido:
        q = q.filter(ilike(Cuidador.primer_apellido_cuidador, primer_apellido))
    if segundo_apellido:
        q = q.filter(ilike(Cuidador.segundo_apellido_cuidador, segundo_apellido))

    total = q.count()
    items = q.order_by(Cuidador.rut_cuidador).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, rut_cuidador: int):
    return db.get(Cuidador, rut_cuidador)

def create(db: Session, data: CuidadorCreate):
    obj = Cuidador(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, rut_cuidador: int, data: CuidadorUpdate):
    obj = get(db, rut_cuidador)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def set_estado(db: Session, rut_cuidador: int, habilitar: bool) -> bool:
    obj = get(db, rut_cuidador)
    if not obj: return False
    obj.estado = habilitar
    db.commit(); db.refresh(obj)
    return True

def delete(db: Session, rut_cuidador: int) -> bool:
    return set_estado(db, rut_cuidador, False)

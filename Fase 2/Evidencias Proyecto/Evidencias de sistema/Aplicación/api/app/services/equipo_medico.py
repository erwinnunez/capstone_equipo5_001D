from sqlalchemy.orm import Session
from app.models.equipo_medico import EquipoMedico
from app.schemas.equipo_medico import EquipoMedicoCreate, EquipoMedicoUpdate

def list_(db: Session, skip: int, limit: int,
          id_cesfam: int | None = None, estado: bool | None = None, q: str | None = None):
    query = db.query(EquipoMedico)
    if id_cesfam is not None:
        query = query.filter(EquipoMedico.id_cesfam == id_cesfam)
    if estado is not None:
        query = query.filter(EquipoMedico.estado == estado)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (EquipoMedico.nombre_medico.ilike(like)) |
            (EquipoMedico.apellido_medico.ilike(like)) |
            (EquipoMedico.email.ilike(like))
        )
    total = query.count()
    items = query.order_by(EquipoMedico.rut_medico).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, rut_medico: int):
    return db.get(EquipoMedico, rut_medico)

def create(db: Session, data: EquipoMedicoCreate):
    obj = EquipoMedico(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, rut_medico: int, data: EquipoMedicoUpdate):
    obj = get(db, rut_medico)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, rut_medico: int):
    obj = get(db, rut_medico)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

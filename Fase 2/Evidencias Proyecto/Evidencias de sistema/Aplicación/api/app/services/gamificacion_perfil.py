from sqlalchemy.orm import Session
from app.models.gamificacion_perfil import GamificacionPerfil
from app.schemas.gamificacion_perfil import GamificacionPerfilCreate, GamificacionPerfilUpdate

def list_(db: Session, skip: int, limit: int, rut_paciente: int | None = None):
    q = db.query(GamificacionPerfil)
    if rut_paciente is not None:
        q = q.filter(GamificacionPerfil.rut_paciente == rut_paciente)
    total = q.count()
    items = q.order_by(GamificacionPerfil.rut_paciente).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, rut_paciente: int):
    return db.get(GamificacionPerfil, rut_paciente)

def create(db: Session, data: GamificacionPerfilCreate):
    obj = GamificacionPerfil(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, rut_paciente: int, data: GamificacionPerfilUpdate):
    obj = get(db, rut_paciente)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, rut_paciente: int):
    obj = get(db, rut_paciente)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

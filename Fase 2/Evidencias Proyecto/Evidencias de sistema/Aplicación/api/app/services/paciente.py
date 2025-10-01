from sqlalchemy.orm import Session
from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteUpdate

def list_(db: Session, skip: int, limit: int, estado: bool | None = None, q: str | None = None):
    query = db.query(Paciente)
    if estado is not None:
        query = query.filter(Paciente.estado == estado)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (Paciente.nombre_paciente.ilike(like)) |
            (Paciente.apellido_paciente.ilike(like)) |
            (Paciente.email.ilike(like)) |
            (Paciente.telefono.ilike(like))
        )
    total = query.count()
    items = query.order_by(Paciente.rut_paciente).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, rut_paciente: int):
    return db.get(Paciente, rut_paciente)

def create(db: Session, data: PacienteCreate):
    obj = Paciente(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, rut_paciente: int, data: PacienteUpdate):
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

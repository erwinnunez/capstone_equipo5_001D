from sqlalchemy.orm import Session
from app.models.paciente_cuidador import PacienteCuidador
from app.schemas.paciente_cuidador import PacienteCuidadorCreate, PacienteCuidadorUpdate

def list_(db: Session, skip: int, limit: int, rut_paciente: int | None = None, rut_cuidador: int | None = None, activo: bool | None = None):
    q = db.query(PacienteCuidador)
    if rut_paciente is not None:
        q = q.filter(PacienteCuidador.rut_paciente == rut_paciente)
    if rut_cuidador is not None:
        q = q.filter(PacienteCuidador.rut_cuidador == rut_cuidador)
    if activo is not None:
        q = q.filter(PacienteCuidador.activo == activo)
    total = q.count()
    items = q.order_by(PacienteCuidador.rut_paciente, PacienteCuidador.rut_cuidador).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, rut_paciente: int, rut_cuidador: int):
    return db.query(PacienteCuidador).get((rut_paciente, rut_cuidador))

def create(db: Session, data: PacienteCuidadorCreate):
    obj = PacienteCuidador(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, rut_paciente: int, rut_cuidador: int, data: PacienteCuidadorUpdate):
    obj = get(db, rut_paciente, rut_cuidador)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, rut_paciente: int, rut_cuidador: int):
    obj = get(db, rut_paciente, rut_cuidador)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

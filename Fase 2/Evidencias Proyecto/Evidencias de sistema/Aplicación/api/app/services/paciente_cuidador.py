from sqlalchemy.orm import Session
from app.models.paciente_cuidador import PacienteCuidador
from app.schemas.paciente_cuidador import PacienteCuidadorCreate

def list_(
    db: Session, skip: int, limit: int,
    rut_paciente: int | None = None,
    rut_cuidador: int | None = None,
    activo: bool | None = None
):
    query = db.query(PacienteCuidador)
    if rut_paciente is not None:
        query = query.filter(PacienteCuidador.rut_paciente == rut_paciente)
    if rut_cuidador is not None:
        query = query.filter(PacienteCuidador.rut_cuidador == rut_cuidador)
    if activo is not None:
        query = query.filter(PacienteCuidador.activo == activo)

    total = query.count()
    items = query.order_by(PacienteCuidador.id.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_: int):
    return db.get(PacienteCuidador, id_)

def create(db: Session, data: PacienteCuidadorCreate):
    obj = PacienteCuidador(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_: int):
    obj = get(db, id_)
    if not obj:
        return False
    db.delete(obj); db.commit()
    return True

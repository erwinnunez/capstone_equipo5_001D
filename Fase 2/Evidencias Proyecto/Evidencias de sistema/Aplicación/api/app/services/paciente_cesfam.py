from sqlalchemy.orm import Session
from app.models.paciente_cesfam import PacienteCesfam
from app.schemas.paciente_cesfam import PacienteCesfamCreate, PacienteCesfamUpdate

def list_(db: Session, skip: int, limit: int,
          rut_paciente: int | None = None, id_cesfam: int | None = None, activo: bool | None = None):
    q = db.query(PacienteCesfam)
    if rut_paciente is not None:
        q = q.filter(PacienteCesfam.rut_paciente == rut_paciente)
    if id_cesfam is not None:
        q = q.filter(PacienteCesfam.id_cesfam == id_cesfam)
    if activo is not None:
        q = q.filter(PacienteCesfam.activo == activo)
    total = q.count()
    items = q.order_by(PacienteCesfam.id_pc.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_pc: int):
    return db.get(PacienteCesfam, id_pc)

def create(db: Session, data: PacienteCesfamCreate):
    obj = PacienteCesfam(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_pc: int, data: PacienteCesfamUpdate):
    obj = get(db, id_pc)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_pc: int):
    obj = get(db, id_pc)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

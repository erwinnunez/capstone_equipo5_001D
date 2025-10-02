from sqlalchemy.orm import Session
from datetime import datetime
from app.models.nota_clinica import NotaClinica
from app.schemas.nota_clinica import NotaClinicaCreate, NotaClinicaUpdate

def list_(db: Session, skip: int, limit: int,
          rut_paciente: int | None = None,
          rut_medico: int | None = None,
          tipo_nota: str | None = None,
          desde: datetime | None = None,
          hasta: datetime | None = None):
    q = db.query(NotaClinica)
    if rut_paciente is not None:
        q = q.filter(NotaClinica.rut_paciente == rut_paciente)
    if rut_medico is not None:
        q = q.filter(NotaClinica.rut_medico == rut_medico)
    if tipo_nota:
        q = q.filter(NotaClinica.tipo_nota == tipo_nota)
    if desde:
        q = q.filter(NotaClinica.creada_en >= desde)
    if hasta:
        q = q.filter(NotaClinica.creada_en < hasta)
    total = q.count()
    items = q.order_by(NotaClinica.creada_en.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_nota: int):
    return db.get(NotaClinica, id_nota)

def create(db: Session, data: NotaClinicaCreate):
    obj = NotaClinica(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_nota: int, data: NotaClinicaUpdate):
    obj = get(db, id_nota)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_nota: int):
    obj = get(db, id_nota)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

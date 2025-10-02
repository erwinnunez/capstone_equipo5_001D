from sqlalchemy.orm import Session
from app.models.paciente_historial import PacienteHistorial
from app.schemas.paciente_historial import PacienteHistorialCreate

def list_(db: Session, skip: int, limit: int, rut_paciente: int | None = None):
    q = db.query(PacienteHistorial)
    if rut_paciente is not None:
        q = q.filter(PacienteHistorial.rut_paciente == rut_paciente)
    total = q.count()
    items = q.order_by(PacienteHistorial.historial_id.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, historial_id: int):
    return db.get(PacienteHistorial, historial_id)

def create(db: Session, data: PacienteHistorialCreate):
    obj = PacienteHistorial(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, historial_id: int):
    obj = get(db, historial_id)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

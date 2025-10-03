from sqlalchemy.orm import Session
from app.models.evento_gamificacion import EventoGamificacion
from app.schemas.evento_gamificacion import EventoGamificacionCreate

def list_(db: Session, skip: int, limit: int, rut_paciente: int | None = None, tipo: str | None = None):
    q = db.query(EventoGamificacion)
    if rut_paciente is not None:
        q = q.filter(EventoGamificacion.rut_paciente == rut_paciente)
    if tipo:
        q = q.filter(EventoGamificacion.tipo == tipo)
    total = q.count()
    items = q.order_by(EventoGamificacion.id_evento.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_evento: int):
    return db.get(EventoGamificacion, id_evento)

def create(db: Session, data: EventoGamificacionCreate):
    obj = EventoGamificacion(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_evento: int):
    obj = get(db, id_evento)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

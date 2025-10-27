from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.medicina_detalle import MedicinaDetalle
from app.schemas.medicina_detalle import MedicinaDetalleCreate, MedicinaDetalleUpdate

def list_(db: Session, skip: int, limit: int,
          rut_paciente: str | None = None,
          id_medicina: int | None = None,
          desde: datetime | None = None,
          hasta: datetime | None = None,
          tomada: bool | None = None):
    q = db.query(MedicinaDetalle)
    if rut_paciente is not None:
        q = q.filter(MedicinaDetalle.rut_paciente == rut_paciente)
    if id_medicina is not None:
        q = q.filter(MedicinaDetalle.id_medicina == id_medicina)
    if desde is not None:
        q = q.filter(MedicinaDetalle.fecha_inicio >= desde)
    if hasta is not None:
        q = q.filter(MedicinaDetalle.fecha_inicio < hasta)
    if tomada is not None:
        q = q.filter(MedicinaDetalle.tomada == tomada)

    total = q.count()
    items = q.order_by(MedicinaDetalle.fecha_inicio.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_detalle: int):
    return db.get(MedicinaDetalle, id_detalle)

def create(db: Session, data: MedicinaDetalleCreate):
    payload = data.model_dump()
    if payload.get("tomada") and not payload.get("fecha_tomada"):
        payload["fecha_tomada"] = datetime.now(timezone.utc)
    obj = MedicinaDetalle(**payload)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_detalle: int, data: MedicinaDetalleUpdate):
    obj = get(db, id_detalle)
    if not obj:
        return None

    payload = data.model_dump(exclude_none=True)
    tomada = payload.pop("tomada", None)
    fecha_tomada = payload.pop("fecha_tomada", None)

    for k, v in payload.items():
        setattr(obj, k, v)

    if tomada is not None:
        if tomada:
            obj.tomada = True
            obj.fecha_tomada = fecha_tomada or datetime.now(timezone.utc)
        else:
            obj.tomada = False
            obj.fecha_tomada = None

    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_detalle: int):
    obj = get(db, id_detalle)
    if not obj:
        return False
    db.delete(obj); db.commit()
    return True

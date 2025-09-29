from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.medicion import Medicion, MedicionDetalle
from app.schemas.medicion import MedicionCreate

def list_(
    db: Session, skip: int, limit: int,
    rut_paciente: int | None = None,
    id_parametro: int | None = None,
    fecha_desde: datetime | None = None,
    fecha_hasta: datetime | None = None
):
    query = db.query(Medicion)

    if rut_paciente is not None:
        query = query.filter(Medicion.rut_paciente == rut_paciente)
    if id_parametro is not None:
        query = query.filter(Medicion.id_parametro == id_parametro)
    if fecha_desde is not None:
        query = query.filter(Medicion.fecha_lectura >= fecha_desde)
    if fecha_hasta is not None:
        query = query.filter(Medicion.fecha_lectura < fecha_hasta)

    total = query.count()
    items = query.order_by(Medicion.fecha_lectura.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_registro: int):
    return db.get(Medicion, id_registro)

def create(db: Session, data: MedicionCreate):
    # crea cabecera
    obj = Medicion(**data.model_dump(exclude={"detalles"}))
    db.add(obj); db.flush()  # obtiene id_registro

    # crea detalles si vienen
    for d in data.detalles:
        db.add(MedicionDetalle(id_registro=obj.id_registro, **d.model_dump()))

    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_registro: int):
    obj = get(db, id_registro)
    if not obj:
        return False
    db.delete(obj); db.commit()
    return True

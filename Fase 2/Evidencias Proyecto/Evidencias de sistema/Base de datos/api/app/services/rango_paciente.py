from sqlalchemy.orm import Session
from app.models.rango_paciente import RangoPaciente
from app.schemas.rango_paciente import RangoPacienteCreate, RangoPacienteUpdate
from app.models.paciente_historial import PacienteHistorial
from datetime import datetime

def list_(db: Session, skip: int, limit: int, rut_paciente: int | None = None, id_parametro: int | None = None, vigente: bool | None = None):
    q = db.query(RangoPaciente)
    if rut_paciente is not None:
        q = q.filter(RangoPaciente.rut_paciente == rut_paciente)
    if id_parametro is not None:
        q = q.filter(RangoPaciente.id_parametro == id_parametro)
    # "vigente" lo dejas para lógica por fechas si quieres (no infiero aquí)
    total = q.count()
    items = q.order_by(RangoPaciente.id_rango.desc()).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_rango: int):
    return db.get(RangoPaciente, id_rango)

def create(db: Session, data: RangoPacienteCreate):
    obj = RangoPaciente(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, id_rango: int, data: RangoPacienteUpdate):
    obj = get(db, id_rango)
    if not obj: return None

    valor_anterior = f"{obj.min_normal}-{obj.max_normal}"


    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)

    # Crear historial
    historial = PacienteHistorial(
        rut_paciente=obj.rut_paciente,
        cambio="Actualización de rango clínico",
        resultado=True,
        fecha_cambio=datetime.utcnow(),
    )
    db.add(historial)
    db.commit()


    return obj

def delete(db: Session, id_rango: int):
    obj = get(db, id_rango)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

def get_by_paciente(db: Session, rut_paciente: int):
    return (
        db.query(RangoPaciente)
        .filter(RangoPaciente.rut_paciente == rut_paciente)
        .order_by(RangoPaciente.id_parametro)
        .all()
    )

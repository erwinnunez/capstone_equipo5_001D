from sqlalchemy.orm import Session
from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteUpdate

def list_(db: Session, skip: int, limit: int,
          id_cesfam: int | None = None,
          id_comuna: int | None = None,
          estado: bool | None = True,
          primer_nombre: str | None = None,
          segundo_nombre: str | None = None,
          primer_apellido: str | None = None,
          segundo_apellido: str | None = None):
    q = db.query(Paciente)
    if id_cesfam is not None:
        q = q.filter(Paciente.id_cesfam == id_cesfam)
    if id_comuna is not None:
        q = q.filter(Paciente.id_comuna == id_comuna)
    if estado is not None:
        q = q.filter(Paciente.estado == estado)

    def ilike(col, txt): return col.ilike(f"%{txt}%")
    if primer_nombre:
        q = q.filter(ilike(Paciente.primer_nombre_paciente, primer_nombre))
    if segundo_nombre:
        q = q.filter(ilike(Paciente.segundo_nombre_paciente, segundo_nombre))
    if primer_apellido:
        q = q.filter(ilike(Paciente.primer_apellido_paciente, primer_apellido))
    if segundo_apellido:
        q = q.filter(ilike(Paciente.segundo_apellido_paciente, segundo_apellido))

    total = q.count()
    items = q.order_by(Paciente.rut_paciente).offset(skip).limit(limit).all()
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

def set_estado(db: Session, rut_paciente: int, habilitar: bool) -> bool:
    obj = get(db, rut_paciente)
    if not obj: return False
    obj.estado = habilitar
    db.commit(); db.refresh(obj)
    return True

def delete(db: Session, rut_paciente: int) -> bool:
    return set_estado(db, rut_paciente, False)

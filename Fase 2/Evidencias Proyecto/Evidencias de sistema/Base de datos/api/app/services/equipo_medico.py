from sqlalchemy.orm import Session
from app.models.equipo_medico import EquipoMedico
from app.schemas.equipo_medico import EquipoMedicoCreate, EquipoMedicoUpdate

def list_(db: Session, skip: int, limit: int,
          id_cesfam: int | None = None,
          estado: bool | None = True,
          primer_nombre: str | None = None,
          segundo_nombre: str | None = None,
          primer_apellido: str | None = None,
          segundo_apellido: str | None = None):
    q = db.query(EquipoMedico)
    if id_cesfam is not None:
        q = q.filter(EquipoMedico.id_cesfam == id_cesfam)
    if estado is not None:
        q = q.filter(EquipoMedico.estado == estado)

    def ilike(col, txt): return col.ilike(f"%{txt}%")
    if primer_nombre:
        q = q.filter(ilike(EquipoMedico.primer_nombre_medico, primer_nombre))
    if segundo_nombre:
        q = q.filter(ilike(EquipoMedico.segundo_nombre_medico, segundo_nombre))
    if primer_apellido:
        q = q.filter(ilike(EquipoMedico.primer_apellido_medico, primer_apellido))
    if segundo_apellido:
        q = q.filter(ilike(EquipoMedico.segundo_apellido_medico, segundo_apellido))

    total = q.count()
    items = q.order_by(EquipoMedico.rut_medico).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, rut_medico: int):
    return db.get(EquipoMedico, rut_medico)

def create(db: Session, data: EquipoMedicoCreate):
    obj = EquipoMedico(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, rut_medico: int, data: EquipoMedicoUpdate):
    obj = get(db, rut_medico)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def set_estado(db: Session, rut_medico: int, habilitar: bool) -> bool:
    obj = get(db, rut_medico)
    if not obj: return False
    obj.estado = habilitar
    db.commit(); db.refresh(obj)
    return True

def delete(db: Session, rut_medico: int) -> bool:
    return set_estado(db, rut_medico, False)

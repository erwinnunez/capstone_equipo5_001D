from sqlalchemy.orm import Session
from app.models.usuario_insignia import UsuarioInsignia
from app.schemas.usuario_insignia import UsuarioInsigniaCreate

def list_(db: Session, skip: int, limit: int,
          rut_paciente: str | None = None,
          id_insignia: int | None = None):
    q = db.query(UsuarioInsignia)
    if rut_paciente is not None:
        q = q.filter(UsuarioInsignia.rut_paciente == rut_paciente)
    if id_insignia is not None:
        q = q.filter(UsuarioInsignia.id_insignia == id_insignia)
    total = q.count()
    items = q.order_by(UsuarioInsignia.rut_paciente, UsuarioInsignia.id_insignia).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, rut_paciente: str, id_insignia: int):
    return db.query(UsuarioInsignia).get((rut_paciente, id_insignia))

def create(db: Session, data: UsuarioInsigniaCreate):
    obj = UsuarioInsignia(**data.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, rut_paciente: str, id_insignia: int):
    obj = get(db, rut_paciente, id_insignia)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

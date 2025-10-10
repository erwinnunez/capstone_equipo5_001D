# app/services/equipo_medico.py
from sqlalchemy.orm import Session
from app.models.equipo_medico import EquipoMedico
from app.schemas.equipo_medico import EquipoMedicoCreate, EquipoMedicoUpdate
from app.core.security import hash_password  # 🔐 usa core

def list_(db: Session, skip: int, limit: int,
          id_cesfam: int | None = None,
          estado: bool | None = True,
          primer_nombre: str | None = None,
          segundo_nombre: str | None = None,
          primer_apellido: str | None = None,
          segundo_apellido: str | None = None,
          is_admin: bool | None = None):
    q = db.query(EquipoMedico)
    if id_cesfam is not None:
        q = q.filter(EquipoMedico.id_cesfam == id_cesfam)
    if estado is not None:
        q = q.filter(EquipoMedico.estado == estado)
    if is_admin is not None:
        q = q.filter(EquipoMedico.is_admin == is_admin)

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
    payload = data.model_dump()
    if payload.get("email"):
        payload["email"] = payload["email"].strip().lower()
    payload["contrasenia"] = hash_password(payload["contrasenia"])
    obj = EquipoMedico(**payload)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, rut_medico: int, data: EquipoMedicoUpdate):
    obj = get(db, rut_medico)
    if not obj: return None
    upd = data.model_dump(exclude_none=True)

    if "email" in upd and isinstance(upd["email"], str):
        upd["email"] = upd["email"].strip().lower()

    if "contrasenia" in upd:
        if upd["contrasenia"]:
            upd["contrasenia"] = hash_password(upd["contrasenia"])
        else:
            upd.pop("contrasenia", None)

    for k, v in upd.items():
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

def find_by_email(db: Session, email: str, only_active: bool = True, only_admin: bool | None = None):
    norm = (email or "").strip().lower()
    q = db.query(EquipoMedico).filter(EquipoMedico.email == norm)
    if only_active:
        q = q.filter(EquipoMedico.estado.is_(True))
    if only_admin is True:
        q = q.filter(EquipoMedico.is_admin.is_(True))
    if only_admin is False:
        q = q.filter((EquipoMedico.is_admin.is_(False)) | (EquipoMedico.is_admin.is_(None)))
    return q.first()

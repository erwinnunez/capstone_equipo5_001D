# app/services/paciente.py
from __future__ import annotations

from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteUpdate
#from app.core.security import hash_password  # 🔐 usa core
from app.core.security_utils import safe_hash_password

def list_(
    db: Session,
    skip: int,
    limit: int,
    id_cesfam: Optional[int] = None,
    id_comuna: Optional[int] = None,
    estado: Optional[bool] = True,
    primer_nombre: Optional[str] = None,
    segundo_nombre: Optional[str] = None,
    primer_apellido: Optional[str] = None,
    segundo_apellido: Optional[str] = None,
) -> Tuple[List[Paciente], int]:
    q = db.query(Paciente)

    if id_cesfam is not None:
        q = q.filter(Paciente.id_cesfam == id_cesfam)
    if id_comuna is not None:
        q = q.filter(Paciente.id_comuna == id_comuna)
    if estado is not None:
        q = q.filter(Paciente.estado == estado)

    def _ilike(col, txt: str):
        return col.ilike(f"%{txt}%")

    if primer_nombre:
        q = q.filter(_ilike(Paciente.primer_nombre_paciente, primer_nombre))
    if segundo_nombre:
        q = q.filter(_ilike(Paciente.segundo_nombre_paciente, segundo_nombre))
    if primer_apellido:
        q = q.filter(_ilike(Paciente.primer_apellido_paciente, primer_apellido))
    if segundo_apellido:
        q = q.filter(_ilike(Paciente.segundo_apellido_paciente, segundo_apellido))

    total = q.with_entities(func.count(Paciente.rut_paciente)).scalar() or 0
    items = q.order_by(Paciente.rut_paciente).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, rut_paciente: int) -> Optional[Paciente]:
    return db.get(Paciente, rut_paciente)

def create(db: Session, data: PacienteCreate) -> Paciente:
    payload = data.model_dump()
    raw = payload.get("contrasena")
    if not raw:
        raise ValueError("contrasena es requerida")
    #payload["contrasena"] = hash_password(raw)
    payload["contrasena"] = safe_hash_password(raw)


    if payload.get("email"):
        payload["email"] = payload["email"].strip().lower()

    obj = Paciente(**payload)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, rut_paciente: int, data: PacienteUpdate) -> Optional[Paciente]:
    obj = get(db, rut_paciente)
    if not obj:
        return None

    upd = data.model_dump(exclude_none=True)

    if "email" in upd and isinstance(upd["email"], str):
        upd["email"] = upd["email"].strip().lower()

    if "contrasena" in upd:
        if upd["contrasena"]:
            #upd["contrasena"] = hash_password(upd["contrasena"])
            upd["contrasena"] = safe_hash_password(upd["contrasena"])
        else:
            upd.pop("contrasena", None)

    for k, v in upd.items():
        setattr(obj, k, v)

    db.commit(); db.refresh(obj)
    return obj

def set_estado(db: Session, rut_paciente: int, habilitar: bool) -> bool:
    obj = get(db, rut_paciente)
    if not obj:
        return False
    obj.estado = habilitar
    db.commit(); db.refresh(obj)
    return True

def delete(db: Session, rut_paciente: int) -> bool:
    return set_estado(db, rut_paciente, False)

def find_by_email(db: Session, email: str, only_active: bool = True) -> Optional[Paciente]:
    if not email:
        return None
    norm = email.strip().lower()
    q = db.query(Paciente).filter(Paciente.email == norm)
    if only_active:
        q = q.filter(Paciente.estado.is_(True))
    return q.first()

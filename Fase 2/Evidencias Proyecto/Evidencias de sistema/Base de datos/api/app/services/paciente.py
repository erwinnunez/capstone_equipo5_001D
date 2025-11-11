from __future__ import annotations

from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import func
import asyncio
import logging

from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteUpdate
from app.core.security import hash_password  # 🔐
from app.services.email import email_service
from app.schemas.email import WelcomeEmail

logger = logging.getLogger(__name__)

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

def get(db: Session, rut_paciente: str) -> Optional[Paciente]:
    return db.get(Paciente, rut_paciente)

def create(db: Session, data: PacienteCreate) -> Paciente:
    payload = data.model_dump()
    raw_password = payload.get("contrasena")
    if not raw_password:
        raise ValueError("contrasena es requerida")

    # Normaliza email
    if payload.get("email"):
        payload["email"] = payload["email"].strip().lower()

    # Validar si el RUT ya existe
    existing_rut = db.query(Paciente).filter(Paciente.rut_paciente == payload["rut_paciente"]).first()
    if existing_rut:
        raise ValueError("El RUT ingresado ya existe")

    # Validar si el email ya existe
    if payload.get("email"):
        existing_email = db.query(Paciente).filter(Paciente.email == payload["email"]).first()
        if existing_email:
            raise ValueError("El email ingresado ya existe")

    # Hash password for storage
    payload["contrasena"] = hash_password(raw_password)

    # Crear paciente en la base de datos
    obj = Paciente(**payload)
    db.add(obj); db.commit(); db.refresh(obj)

    # Enviar email de bienvenida si hay email
    if obj.email:
        try:
            primer_nombre = obj.primer_nombre_paciente or ""
            segundo_nombre = obj.segundo_nombre_paciente or ""
            primer_apellido = obj.primer_apellido_paciente or ""
            segundo_apellido = obj.segundo_apellido_paciente or ""
            full_name = f"{primer_nombre} {segundo_nombre} {primer_apellido} {segundo_apellido}".strip()
            full_name = " ".join(full_name.split())
            welcome_data = WelcomeEmail(
                to=obj.email,
                patient_name=full_name,
                temporary_password=raw_password
            )
            async def send_welcome():
                try:
                    result = await email_service.send_welcome_email(welcome_data)
                    if result["success"]:
                        logger.info(f"Welcome email sent successfully to {obj.email}")
                    else:
                        logger.error(f"Failed to send welcome email to {obj.email}: {result['message']}")
                except Exception as e:
                    logger.error(f"Exception sending welcome email to {obj.email}: {str(e)}")
            try:
                asyncio.create_task(send_welcome())
                logger.info(f"Welcome email scheduled for {obj.email}")
            except RuntimeError:
                try:
                    asyncio.run(send_welcome())
                    logger.info(f"Welcome email sent synchronously to {obj.email}")
                except Exception as e:
                    logger.error(f"Failed to send welcome email: {str(e)}")
        except Exception as e:
            logger.error(f"Error preparing welcome email for {obj.email}: {str(e)}")
    return obj

def update(db: Session, rut_paciente: str, data: PacienteUpdate) -> Optional[Paciente]:
    obj = get(db, rut_paciente)
    if not obj:
        return None

    upd = data.model_dump(exclude_none=True)

    if "email" in upd and isinstance(upd["email"], str):
        upd["email"] = upd["email"].strip().lower()

    if "contrasena" in upd:
        if upd["contrasena"]:
            upd["contrasena"] = hash_password(upd["contrasena"])
        else:
            upd.pop("contrasena", None)

    for k, v in upd.items():
        setattr(obj, k, v)

    db.commit(); db.refresh(obj)
    return obj

def set_estado(db: Session, rut_paciente: str, habilitar: bool) -> bool:
    obj = get(db, rut_paciente)
    if not obj:
        return False
    obj.estado = habilitar
    db.commit(); db.refresh(obj)
    return True

def delete(db: Session, rut_paciente: str) -> bool:
    return set_estado(db, rut_paciente, False)

def find_by_email(db: Session, email: str, only_active: bool = True) -> Optional[Paciente]:
    if not email:
        return None
    norm = email.strip().lower()
    q = db.query(Paciente).filter(Paciente.email == norm)
    if only_active:
        q = q.filter(Paciente.estado.is_(True))
    return q.first()

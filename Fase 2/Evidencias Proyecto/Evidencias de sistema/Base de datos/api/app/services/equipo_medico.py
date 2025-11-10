from sqlalchemy.orm import Session
import asyncio
import logging

from app.models.equipo_medico import EquipoMedico
from app.schemas.equipo_medico import EquipoMedicoCreate, EquipoMedicoUpdate
from app.core.security import hash_password  # 🔐
from app.services.email import email_service
from app.schemas.email import WelcomeEmail

logger = logging.getLogger(__name__)

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

def get(db: Session, rut_medico: str):
    return db.get(EquipoMedico, rut_medico)

def create(db: Session, data: EquipoMedicoCreate):
    payload = data.model_dump()
    raw_password = payload.get("contrasenia")
    if not raw_password:
        raise ValueError("contrasenia es requerida")
    
    if payload.get("email"):
        payload["email"] = payload["email"].strip().lower()
    
    # Hash password for storage
    payload["contrasenia"] = hash_password(raw_password)
    
    # Create medical staff in database
    obj = EquipoMedico(**payload)
    db.add(obj); db.commit(); db.refresh(obj)
    
    # Send welcome email if email is provided
    if obj.email:
        try:
            # Get medical staff name for email
            primer_nombre = obj.primer_nombre_medico or ""
            segundo_nombre = obj.segundo_nombre_medico or ""
            primer_apellido = obj.primer_apellido_medico or ""
            segundo_apellido = obj.segundo_apellido_medico or ""
            
            full_name = f"{primer_nombre} {segundo_nombre} {primer_apellido} {segundo_apellido}".strip()
            full_name = " ".join(full_name.split())  # Clean multiple spaces
            
            # Create welcome email data
            welcome_data = WelcomeEmail(
                to=obj.email,
                patient_name=full_name,
                rut=obj.rut_medico,
                temporary_password=raw_password  # Send the original password
            )
            
            # Send email asynchronously
            async def send_welcome():
                try:
                    result = await email_service.send_welcome_email(welcome_data)
                    if result["success"]:
                        logger.info(f"Welcome email sent successfully to {obj.email}")
                    else:
                        logger.error(f"Failed to send welcome email to {obj.email}: {result['message']}")
                except Exception as e:
                    logger.error(f"Exception sending welcome email to {obj.email}: {str(e)}")
            
            # Schedule the email to be sent
            try:
                asyncio.create_task(send_welcome())
                logger.info(f"Welcome email scheduled for {obj.email}")
            except RuntimeError:
                # If no event loop is running, run in a new one
                try:
                    asyncio.run(send_welcome())
                    logger.info(f"Welcome email sent synchronously to {obj.email}")
                except Exception as e:
                    logger.error(f"Failed to send welcome email: {str(e)}")
                    
        except Exception as e:
            # Log error but don't fail medical staff creation
            logger.error(f"Error preparing welcome email for {obj.email}: {str(e)}")
    
    return obj

def update(db: Session, rut_medico: str, data: EquipoMedicoUpdate):
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

def set_estado(db: Session, rut_medico: str, habilitar: bool) -> bool:
    obj = get(db, rut_medico)
    if not obj: return False
    obj.estado = habilitar
    db.commit(); db.refresh(obj)
    return True

def delete(db: Session, rut_medico: str) -> bool:
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

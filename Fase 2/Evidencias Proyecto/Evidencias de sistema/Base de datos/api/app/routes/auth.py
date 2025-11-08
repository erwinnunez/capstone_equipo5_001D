# app/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db import get_db

# 🔐 Usa SIEMPRE el mismo módulo de seguridad en toda la app
from app.core.security import verify_with_variant, needs_rehash, hash_password

from app.services import paciente as svc_paciente
from app.services import cuidador as svc_cuidador
from app.services import equipo_medico as svc_medico

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginIn(BaseModel):
    email: EmailStr
    password: str
    role: str  # "admin" | "doctor" | "caregiver" | "patient"

class FrontUser(BaseModel):
    id: str
    name: str
    role: str
    email: EmailStr
    rut_paciente: str | None = None

class LoginOut(BaseModel):
    user: FrontUser
    token: str | None = None

def _nombre_medico(m):
    sn = f" {m.segundo_nombre_medico}" if getattr(m, "segundo_nombre_medico", None) else ""
    sa = f" {m.segundo_apellido_medico}" if getattr(m, "segundo_apellido_medico", None) else ""
    return f"{m.primer_nombre_medico}{sn} {m.primer_apellido_medico}{sa}".strip()

def _nombre_paciente(p):
    sn = f" {p.segundo_nombre_paciente}" if getattr(p, "segundo_nombre_paciente", None) else ""
    sa = f" {p.segundo_apellido_paciente}" if getattr(p, "segundo_apellido_paciente", None) else ""
    return f"{p.primer_nombre_paciente}{sn} {p.primer_apellido_paciente}{sa}".strip()

def _nombre_cuidador(c):
    sn = f" {c.segundo_nombre_cuidador}" if getattr(c, "segundo_nombre_cuidador", None) else ""
    sa = f" {c.segundo_apellido_cuidador}" if getattr(c, "segundo_apellido_cuidador", None) else ""
    return f"{c.primer_nombre_cuidador}{sn} {c.primer_apellido_cuidador}{sa}".strip()

@router.post("/login", response_model=LoginOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    pwd = payload.password or ""

    if payload.role == "admin":
        # Admin = médico activo con is_admin=True
        medico = svc_medico.find_by_email(db, email=email, only_active=True, only_admin=True)
        if not medico:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        ok, variant = verify_with_variant(pwd, medico.contrasenia)
        if not ok:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        # Rehash “en caliente” si el hash es legacy o desactualizado
        if variant == "legacy" or needs_rehash(medico.contrasenia):
            medico.contrasenia = hash_password(pwd)
            db.commit(); db.refresh(medico)

        user = FrontUser(
            id=str(medico.rut_medico),
            name=_nombre_medico(medico),
            role="admin",
            email=medico.email,
        )
        return LoginOut(user=user, token=None)

    if payload.role == "doctor":
        medico = svc_medico.find_by_email(db, email=email, only_active=True, only_admin=False)
        if not medico:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        ok, variant = verify_with_variant(pwd, medico.contrasenia)
        if not ok:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        if variant == "legacy" or needs_rehash(medico.contrasenia):
            medico.contrasenia = hash_password(pwd)
            db.commit(); db.refresh(medico)

        user = FrontUser(
            id=str(medico.rut_medico),
            name=_nombre_medico(medico),
            role="doctor",
            email=medico.email,
        )
        return LoginOut(user=user, token=None)

    if payload.role == "caregiver":
        cuidador = svc_cuidador.find_by_email(db, email=email, only_active=True)
        if not cuidador:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        ok, variant = verify_with_variant(pwd, cuidador.contrasena)
        if not ok:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        if variant == "legacy" or needs_rehash(cuidador.contrasena):
            cuidador.contrasena = hash_password(pwd)
            db.commit(); db.refresh(cuidador)

        user = FrontUser(
            id=str(cuidador.rut_cuidador),
            name=_nombre_cuidador(cuidador),
            role="caregiver",
            email=cuidador.email,
        )
        return LoginOut(user=user, token=None)

    if payload.role == "patient":
        paciente = svc_paciente.find_by_email(db, email=email, only_active=True)
        if not paciente:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        ok, variant = verify_with_variant(pwd, paciente.contrasena)
        if not ok:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        if variant == "legacy" or needs_rehash(paciente.contrasena):
            paciente.contrasena = hash_password(pwd)
            db.commit(); db.refresh(paciente)

        user = FrontUser(
            id=str(paciente.rut_paciente),
            name=_nombre_paciente(paciente),
            role="patient",
            email=paciente.email,
            rut_paciente=paciente.rut_paciente,
        )
        return LoginOut(user=user, token=None)

    raise HTTPException(status_code=400, detail="Rol no soportado")

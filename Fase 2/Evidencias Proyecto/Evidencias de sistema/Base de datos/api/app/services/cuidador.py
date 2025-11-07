# app/services/cuidador.py
from sqlalchemy.orm import Session
from app.models.cuidador import Cuidador
from app.schemas.cuidador import CuidadorCreate, CuidadorUpdate
from app.core.security import hash_password  # 🔐 usa core

def list_(db: Session, skip: int, limit: int,
          estado: bool | None = True,
          primer_nombre: str | None = None,
          segundo_nombre: str | None = None,
          primer_apellido: str | None = None,
          segundo_apellido: str | None = None):
    q = db.query(Cuidador)
    if estado is not None:
        q = q.filter(Cuidador.estado == estado)

    def ilike(col, txt): return col.ilike(f"%{txt}%")
    if primer_nombre:
        q = q.filter(ilike(Cuidador.primer_nombre_cuidador, primer_nombre))
    if segundo_nombre:
        q = q.filter(ilike(Cuidador.segundo_nombre_cuidador, segundo_nombre))
    if primer_apellido:
        q = q.filter(ilike(Cuidador.primer_apellido_cuidador, primer_apellido))
    if segundo_apellido:
        q = q.filter(ilike(Cuidador.segundo_apellido_cuidador, segundo_apellido))

    total = q.count()
    items = q.order_by(Cuidador.rut_cuidador).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, rut_cuidador: str):
    return db.get(Cuidador, rut_cuidador)

def create(db: Session, data: CuidadorCreate):
    payload = data.model_dump()
    if payload.get("email"):
        payload["email"] = payload["email"].strip().lower()
    payload["contrasena"] = hash_password(payload["contrasena"])
    obj = Cuidador(**payload)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, rut_cuidador: str, data: CuidadorUpdate):
    print(f"SERVICE UPDATE - RUT: {rut_cuidador}")
    
    obj = get(db, rut_cuidador)
    if not obj: 
        print("SERVICE UPDATE - Objeto no encontrado")
        return None
    
    upd = data.model_dump(exclude_none=True)
    print(f"SERVICE UPDATE - Datos a actualizar: {upd}")
    
    # Si no hay cambios, retornar el objeto actual
    if not upd:
        print("SERVICE UPDATE - No hay datos para actualizar")
        return obj

    if "email" in upd and isinstance(upd["email"], str):
        upd["email"] = upd["email"].strip().lower()
        print(f"SERVICE UPDATE - Email normalizado: {upd['email']}")

    if "contrasena" in upd:
        if upd["contrasena"]:
            upd["contrasena"] = hash_password(upd["contrasena"])
            print("SERVICE UPDATE - Contraseña hasheada")
        else:
            upd.pop("contrasena", None)
            print("SERVICE UPDATE - Contraseña vacía removida")

    # Aplicar cambios solo si hay diferencias
    changes_made = False
    for k, v in upd.items():
        current_value = getattr(obj, k, None)
        print(f"SERVICE UPDATE - Campo {k}: actual='{current_value}', nuevo='{v}'")
        if current_value != v:
            setattr(obj, k, v)
            changes_made = True
            print(f"SERVICE UPDATE - Campo {k} actualizado")
    
    print(f"SERVICE UPDATE - Cambios realizados: {changes_made}")
    
    # Solo hacer commit si hubo cambios reales
    if changes_made:
        print("SERVICE UPDATE - Haciendo commit...")
        db.commit()
        db.refresh(obj)
        print("SERVICE UPDATE - Commit exitoso")
    else:
        print("SERVICE UPDATE - No se requiere commit")
    
    return obj

def set_estado(db: Session, rut_cuidador: str, habilitar: bool) -> bool:
    obj = get(db, rut_cuidador)
    if not obj: return False
    obj.estado = habilitar
    db.commit(); db.refresh(obj)
    return True

def delete(db: Session, rut_cuidador: str) -> bool:
    return set_estado(db, rut_cuidador, False)

def find_by_email(db: Session, email: str, only_active: bool = True):
    norm = (email or "").strip().lower()
    q = db.query(Cuidador).filter(Cuidador.email == norm)
    if only_active:
        q = q.filter(Cuidador.estado.is_(True))
    return q.first()

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.cuidador import CuidadorCreate, CuidadorUpdate, CuidadorOut, CuidadorSetEstado
from app.services import cuidador as svc
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cuidador", tags=["cuidador"])

@router.get("", response_model=Page[CuidadorOut])
def list_cuidadores(page: int = 1, page_size: int = 20,
                    estado: bool | None = Query(True),
                    primer_nombre: str | None = Query(None),
                    segundo_nombre: str | None = Query(None),
                    primer_apellido: str | None = Query(None),
                    segundo_apellido: str | None = Query(None),
                    db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size,
                             estado=estado, primer_nombre=primer_nombre, segundo_nombre=segundo_nombre,
                             primer_apellido=primer_apellido, segundo_apellido=segundo_apellido)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/email/{email}", response_model=CuidadorOut)
def find_cuidador_by_email(email: str, only_active: bool = Query(True), db: Session = Depends(get_db)):
    """Buscar cuidador por email"""
    obj = svc.find_by_email(db, email, only_active)
    if not obj: 
        raise HTTPException(404, "Cuidador no encontrado")
    return obj

@router.get("/{rut_cuidador}", response_model=CuidadorOut)
def get_cuidador(rut_cuidador: str, db: Session = Depends(get_db)):
    """Buscar cuidador por RUT"""
    obj = svc.get(db, rut_cuidador)
    if not obj: 
        raise HTTPException(404, "Cuidador no encontrado")
    return obj

@router.post("", response_model=CuidadorOut, status_code=status.HTTP_201_CREATED)
def create_cuidador(payload: CuidadorCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{rut_cuidador}", response_model=CuidadorOut)
def update_cuidador(rut_cuidador: str, payload: CuidadorUpdate, db: Session = Depends(get_db)):
    """Actualizar cuidador por RUT"""
    # Log de datos recibidos para debugging - usando print para asegurar que se vea
    print(f"=== DEBUGGING CUIDADOR UPDATE ===")
    print(f"RUT: {rut_cuidador}")
    print(f"Payload recibido: {payload.model_dump()}")
    print(f"Payload sin None: {payload.model_dump(exclude_none=True)}")
    
    # Verificar que el cuidador existe antes de actualizar
    existing = svc.get(db, rut_cuidador)
    if not existing:
        print(f"ERROR: Cuidador {rut_cuidador} no encontrado")
        raise HTTPException(404, "Cuidador no encontrado")
    
    print(f"Cuidador encontrado: {existing.rut_cuidador}")
    
    # Realizar la actualización
    try:
        obj = svc.update(db, rut_cuidador, payload)
        if not obj: 
            print(f"ERROR: svc.update retornó None")
            raise HTTPException(500, "Error interno al actualizar cuidador")
        
        print(f"Actualización exitosa: {rut_cuidador}")
        print("=== FIN DEBUGGING ===")
        return obj
    except Exception as e:
        print(f"ERROR en update: {str(e)}")
        print("=== FIN DEBUGGING CON ERROR ===")
        raise

@router.post("/{rut_cuidador}/debug-update")
def debug_update_cuidador(rut_cuidador: str, payload: CuidadorUpdate, db: Session = Depends(get_db)):
    """Endpoint temporal para debugging de updates"""
    # Obtener cuidador actual
    existing = svc.get(db, rut_cuidador)
    if not existing:
        raise HTTPException(404, "Cuidador no encontrado")
    
    # Mostrar datos actuales
    current_data = {
        "rut_cuidador": existing.rut_cuidador,
        "primer_nombre_cuidador": existing.primer_nombre_cuidador,
        "segundo_nombre_cuidador": existing.segundo_nombre_cuidador,
        "primer_apellido_cuidador": existing.primer_apellido_cuidador,
        "segundo_apellido_cuidador": existing.segundo_apellido_cuidador,
        "sexo": existing.sexo,
        "direccion": existing.direccion,
        "telefono": existing.telefono,
        "email": existing.email,
        "estado": existing.estado
    }
    
    # Mostrar datos que se quieren actualizar
    update_data = payload.model_dump(exclude_none=True)
    
    return {
        "message": "Datos para debugging",
        "current_data": current_data,
        "update_data": update_data,
        "fields_to_update": list(update_data.keys()) if update_data else []
    }

@router.post("/{rut_cuidador}/estado")
def set_estado_cuidador(rut_cuidador: str, payload: CuidadorSetEstado, db: Session = Depends(get_db)):
    ok = svc.set_estado(db, rut_cuidador, payload.habilitar)
    if not ok: 
        raise HTTPException(404, "Cuidador no encontrado")
    return {"message": "OK", "habilitado": payload.habilitar}

@router.delete("/{rut_cuidador}")
def delete_cuidador(rut_cuidador: str, db: Session = Depends(get_db)):
    ok = svc.delete(db, rut_cuidador)
    if not ok: 
        raise HTTPException(404, "Cuidador no encontrado")
    return {"message": "Disabled"}

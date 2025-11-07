from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.paciente import PacienteCreate, PacienteUpdate, PacienteOut, PacienteSetEstado
from app.services import paciente as svc
from app.models.paciente import Paciente

router = APIRouter(prefix="/paciente", tags=["paciente"])

@router.get("", response_model=Page[PacienteOut])
def list_paciente(page: int = 1, page_size: int = 20,
                  id_cesfam: int | None = Query(None),
                  id_comuna: int | None = Query(None),
                  estado: bool | None = Query(True),
                  primer_nombre: str | None = Query(None),
                  segundo_nombre: str | None = Query(None),
                  primer_apellido: str | None = Query(None),
                  segundo_apellido: str | None = Query(None),
                  db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size,
                             id_cesfam=id_cesfam, id_comuna=id_comuna, estado=estado,
                             primer_nombre=primer_nombre, segundo_nombre=segundo_nombre,
                             primer_apellido=primer_apellido, segundo_apellido=segundo_apellido)
    return Page(items=items, total=total, page=page, page_size=page_size)

@router.get("/email/{email}", response_model=PacienteOut)
def find_paciente_by_email(email: str, only_active: bool = Query(True), db: Session = Depends(get_db)):
    """Buscar paciente por email"""
    obj = svc.find_by_email(db, email, only_active)
    if not obj: 
        raise HTTPException(404, "Paciente no encontrado")
    return obj

@router.get("/{rut_paciente}", response_model=PacienteOut)
def get_paciente(rut_paciente: str, only_active: bool = Query(True), db: Session = Depends(get_db)):
    """Buscar paciente por RUT"""
    if only_active:
        # Buscar solo pacientes activos
        obj = db.query(Paciente).filter(
            Paciente.rut_paciente == rut_paciente,
            Paciente.estado == True
        ).first()
    else:
        # Buscar cualquier paciente (activo o inactivo)
        obj = svc.get(db, rut_paciente)
    
    if not obj: 
        raise HTTPException(404, "Paciente no encontrado")
    return obj

@router.post("", response_model=PacienteOut, status_code=status.HTTP_201_CREATED)
def create_paciente(payload: PacienteCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{rut_paciente}", response_model=PacienteOut)
def update_paciente(rut_paciente: str, payload: PacienteUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, rut_paciente, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("/{rut_paciente}/estado")
def set_estado_paciente(rut_paciente: str, payload: PacienteSetEstado, db: Session = Depends(get_db)):
    ok = svc.set_estado(db, rut_paciente, payload.habilitar)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "OK", "habilitado": payload.habilitar}

@router.delete("/{rut_paciente}")
def delete_paciente(rut_paciente: str, db: Session = Depends(get_db)):
    ok = svc.delete(db, rut_paciente)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Disabled"}

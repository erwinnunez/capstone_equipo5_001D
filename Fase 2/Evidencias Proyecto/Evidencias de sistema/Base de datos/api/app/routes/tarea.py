from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.tarea import TareaCreate, TareaUpdate, TareaOut
from app.services import tarea as svc
from app.db import get_db
from app.models import tarea

router = APIRouter(prefix="/tareas", tags=["Tareas"])

@router.get("/{rut_paciente}", response_model=list[TareaOut])
def list_tareas(rut_paciente: int, db: Session = Depends(get_db)):
    """Lista las tareas de un paciente."""
    return svc.list_by_paciente(db, rut_paciente)

@router.post("", response_model=TareaOut, status_code=status.HTTP_201_CREATED)
def create_tarea(payload: TareaCreate, db: Session = Depends(get_db)):
    """Crea una nueva tarea (doctor)."""
    return svc.create(db, payload)

@router.patch("/{id_tarea}", response_model=TareaOut)
def update_tarea(id_tarea: int, payload: TareaUpdate, db: Session = Depends(get_db)):
    """Permite al doctor o cuidador editar una tarea o marcarla como completada."""
    obj = svc.update(db, id_tarea, payload)
    if not obj:
        raise HTTPException(404, "Tarea no encontrada")
    return obj

@router.patch("/{id_tarea}", response_model=TareaOut)
def update_tarea(id_tarea: int, tarea_in: TareaUpdate, db: Session = Depends(get_db)):
    tarea = db.query(tarea).filter(tarea.id_tarea == id_tarea).first()
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    for key, value in tarea_in.dict(exclude_unset=True).items():
        setattr(tarea, key, value)

    db.commit()
    db.refresh(tarea)
    return tarea


@router.delete("/{id_tarea}")
def delete_tarea(id_tarea: int, db: Session = Depends(get_db)):
    """Permite al doctor eliminar una tarea."""
    ok = svc.delete(db, id_tarea)
    if not ok:
        raise HTTPException(404, "Tarea no encontrada")
    return {"message": "Tarea eliminada correctamente"}

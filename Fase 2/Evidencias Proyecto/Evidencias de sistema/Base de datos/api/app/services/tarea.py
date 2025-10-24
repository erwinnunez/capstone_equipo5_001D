from sqlalchemy.orm import Session
from app.models.tarea import Tarea
from app.schemas.tarea import TareaCreate, TareaUpdate

def list_by_paciente(db: Session, rut_paciente: int):
    """Devuelve todas las tareas asociadas a un paciente."""
    return db.query(Tarea).filter(Tarea.rut_paciente == rut_paciente).all()

def create(db: Session, data: TareaCreate):
    """Crea una nueva tarea (doctor)."""
    obj = Tarea(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update(db: Session, id_tarea: int, data: TareaUpdate):
    """Actualiza descripción, nota o estado."""
    tarea = db.get(Tarea, id_tarea)
    if not tarea:
        return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(tarea, k, v)
    db.commit()
    db.refresh(tarea)
    return tarea

def delete(db: Session, id_tarea: int):
    """Elimina una tarea."""
    tarea = db.get(Tarea, id_tarea)
    if not tarea:
        return False
    db.delete(tarea)
    db.commit()
    return True

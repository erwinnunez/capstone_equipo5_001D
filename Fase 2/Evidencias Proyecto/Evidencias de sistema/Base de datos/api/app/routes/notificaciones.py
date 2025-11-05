from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Notificacion
from app.schemas.notificaciones import NotificacionOut

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])

@router.get("/cuidador/{rut_cuidador}")
def listar_notificaciones(
    rut_cuidador: int,
    page: int = Query(1, ge=1),
    limit: int = Query(7, ge=1, le=50),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit

    q = db.query(Notificacion).filter_by(rut_cuidador=rut_cuidador)
    total = q.count()  # Total de notificaciones para el paginador

    items = (
        q.order_by(Notificacion.creada_en.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"items": items, "total": total}

@router.patch("/{id}/leer")
def marcar_leida(id: int, db: Session = Depends(get_db)):
    notif = db.query(Notificacion).filter_by(id_notificacion=id).first()
    if notif:
        notif.leida = True
        db.commit()
        return {"msg": "Notificación marcada como leída"}
    return {"error": "Notificación no encontrada"}

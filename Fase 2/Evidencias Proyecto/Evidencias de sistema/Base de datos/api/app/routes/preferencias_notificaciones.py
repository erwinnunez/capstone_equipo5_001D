from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import PreferenciaNotificacion
from app.schemas.notificaciones import PreferenciaNotificacionIn, PreferenciaNotificacionOut

router = APIRouter(prefix="/preferencias", tags=["Preferencias de notificación"])

@router.get("/{rut_cuidador}", response_model=PreferenciaNotificacionOut)
def obtener_preferencias(rut_cuidador: int, db: Session = Depends(get_db)):
    pref = db.query(PreferenciaNotificacion).filter_by(rut_cuidador=rut_cuidador).first()
    if not pref:
        pref = PreferenciaNotificacion(
            rut_cuidador=rut_cuidador,
            recibir_criticas=True,
            recibir_moderadas=True,
            recibir_leves=False,
            canal_app=True,
            canal_email=False,
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


@router.put("/{rut_cuidador}", response_model=PreferenciaNotificacionOut)
def actualizar_preferencias(rut_cuidador: int, datos: PreferenciaNotificacionIn, db: Session = Depends(get_db)):
    pref = db.query(PreferenciaNotificacion).filter_by(rut_cuidador=rut_cuidador).first()
    if not pref:
        pref = PreferenciaNotificacion(rut_cuidador=rut_cuidador, **datos.dict())
        db.add(pref)
    else:
        for campo, valor in datos.dict().items():
            setattr(pref, campo, valor)
    db.commit()
    db.refresh(pref)
    return pref

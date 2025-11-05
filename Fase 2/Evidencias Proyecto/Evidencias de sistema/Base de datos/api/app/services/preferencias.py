# app/services/preferencias.py
from app.models import PreferenciaNotificacion
from sqlalchemy.orm import Session

def get_preferencias(db: Session, rut_cuidador: int):
    pref = db.query(PreferenciaNotificacion).filter_by(rut_cuidador=rut_cuidador).first()
    if not pref:
        # valores por defecto si no existen
        return {
            "recibir_criticas": True,
            "recibir_moderadas": True,
            "recibir_leves": False,
            "canal_app": True,
            "canal_email": False,
        }
    return {
        "recibir_criticas": pref.recibir_criticas,
        "recibir_moderadas": pref.recibir_moderadas,
        "recibir_leves": pref.recibir_leves,
        "canal_app": pref.canal_app,
        "canal_email": pref.canal_email,
    }

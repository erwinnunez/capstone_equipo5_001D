# app/services/svc_notificaciones.py
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.notificaciones import Notificacion
from app.models.paciente_cuidador import PacienteCuidador
from app.models.preferencia_notificaciones import PreferenciaNotificacion
from app.services.email import enviar_email
from app.models.paciente import Paciente


def crear_notificacion(
    db: Session,
    rut_paciente: int,
    tipo: str,
    severidad: str,
    titulo: str,
    mensaje: str,
):
    """
    Crea una notificación para el paciente y sus cuidadores activos,
    respetando las preferencias de notificación configuradas por cada uno.
    """

    # Obtener paciente
    paciente = db.query(Paciente).filter_by(rut_paciente=rut_paciente).first()

    # Crear notificación base para el paciente
    noti_paciente = Notificacion(
        rut_paciente=rut_paciente,
        tipo=tipo,
        severidad=severidad,
        titulo=titulo,
        mensaje=mensaje,
        leida=False,
        creada_en=datetime.now(timezone.utc),
    )
    db.add(noti_paciente)

    # Buscar cuidadores activos asociados
    cuidadores = (
        db.query(PacienteCuidador)
        .filter(
            PacienteCuidador.rut_paciente == rut_paciente,
            PacienteCuidador.activo == True
        )
        .all()
    )

    # Crear notificación individual para cada cuidador
    if cuidadores:
        enviados = 0
        for c in cuidadores:
            pref = db.query(PreferenciaNotificacion).filter_by(rut_cuidador=c.rut_cuidador).first()

            # Si no tiene preferencias guardadas, usar valores por defecto
            if not pref:
                pref = PreferenciaNotificacion(
                    rut_cuidador=c.rut_cuidador,
                    recibir_criticas=True,
                    recibir_moderadas=True,
                    recibir_leves=False,
                    canal_app=True,
                    canal_email=True,
                )
                db.add(pref)
                db.commit()
                db.refresh(pref)

            # Verificar si debe recibir esta severidad
            if (
                (severidad == "critica" and not pref.recibir_criticas)
                or (severidad == "moderada" and not pref.recibir_moderadas)
                or (severidad == "leve" and not pref.recibir_leves)
            ):
                print(f"Cuidador {c.rut_cuidador} tiene desactivadas las alertas '{severidad}'")
                continue

            # Enviar por app si corresponde
            if pref.canal_app:
                noti_c = Notificacion(
                    rut_paciente=rut_paciente,
                    rut_cuidador=c.rut_cuidador,
                    tipo=tipo,
                    severidad=severidad,
                    titulo=titulo,
                    mensaje=mensaje,
                    leida=False,
                    creada_en=datetime.now(timezone.utc),
                )
                db.add(noti_c)
                enviados += 1

            # Enviar por correo (si canal_email está activo)
            if pref.canal_email and c.cuidador and c.cuidador.email:
                asunto = f"[{severidad.upper()}] {titulo}"
                cuerpo = f"""
                <h2>Alerta del paciente {paciente.primer_nombre_paciente}</h2>
                <p><b>{titulo}</b></p>
                <p>{mensaje}</p>
                <hr>
                <small>Fecha de generación: {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}</small>
                """
                exito = enviar_email(c.cuidador.email, asunto, cuerpo)
                if exito:
                    noti_c.enviado_email = True

        print(f"Notificaciones generadas para {enviados} cuidadores del paciente {rut_paciente}.")
    else:
        print(f"Paciente {rut_paciente} sin cuidadores activos: notificación solo para él.")

    # Guardar todo
    db.commit()
    db.refresh(noti_paciente)
    return noti_paciente


def marcar_como_leida(db: Session, id_notificacion: int) -> Notificacion | None:
    """Marca una notificación como leída"""
    noti = db.get(Notificacion, id_notificacion)
    if not noti:
        return None
    noti.leida = True
    noti.leida_en = datetime.now(timezone.utc)
    db.commit()
    db.refresh(noti)
    return noti


def listar_por_usuario(
    db: Session,
    rut_paciente: int | None = None,
    rut_cuidador: int | None = None,
    skip: int = 0,
    limit: int = 7,
):
    """Lista notificaciones con filtros y paginación"""
    q = db.query(Notificacion)

    if rut_cuidador:
        q = q.filter(Notificacion.rut_cuidador == rut_cuidador)
    elif rut_paciente:
        q = q.filter(Notificacion.rut_paciente == rut_paciente)

    total = q.count()
    items = (
        q.order_by(Notificacion.creada_en.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"items": items, "total": total}






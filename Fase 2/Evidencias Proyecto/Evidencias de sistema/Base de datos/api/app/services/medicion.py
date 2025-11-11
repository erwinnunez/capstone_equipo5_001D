from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from app.models.paciente_cuidador import PacienteCuidador
from app.models.medicion import Medicion
from app.schemas.medicion import MedicionCreate, MedicionUpdate

def list_(
    db: Session,
    skip: int,
    limit: int,
    rut_paciente: str | None = None,
    desde: datetime | None = None,
    hasta: datetime | None = None,
    tiene_alerta: bool | None = None,
    estado_alerta: str | None = None,
    tomada_por: str | None = None,
):
    q = db.query(Medicion)

    if rut_paciente is not None:
        q = q.filter(Medicion.rut_paciente == rut_paciente)
    if desde:
        q = q.filter(Medicion.fecha_registro >= desde)
    if hasta:
        q = q.filter(Medicion.fecha_registro < hasta)
    if tiene_alerta is not None:
        q = q.filter(Medicion.tiene_alerta == tiene_alerta)
    if estado_alerta:
        q = q.filter(Medicion.estado_alerta == estado_alerta)
    if tomada_por is not None:
        q = q.filter(Medicion.tomada_por == tomada_por)

    total = db.query(func.count(Medicion.id_medicion)).select_from(q.subquery()).scalar()

    items = (
        q.order_by(Medicion.fecha_registro.desc())
         .offset(skip)
         .limit(limit)
         .all()
    )
    return items, total

def get(db: Session, id_medicion: int):
    return db.get(Medicion, id_medicion)

def create(db: Session, data: MedicionCreate):
    obj = Medicion(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)

    # Si la medición tiene alerta, enviar correo a los cuidadores activos
    if obj.tiene_alerta:
        from app.models.paciente_cuidador import PacienteCuidador
        from app.models.cuidador import Cuidador
        from app.services.email import email_service
        from app.schemas.email import AlertNotification
        import asyncio
        # Buscar cuidadores activos del paciente
        cuidadores = (
            db.query(Cuidador)
            .join(PacienteCuidador, Cuidador.rut_cuidador == PacienteCuidador.rut_cuidador)
            .filter(PacienteCuidador.rut_paciente == obj.rut_paciente)
            .filter(PacienteCuidador.activo.is_(True))
            .filter(Cuidador.estado.is_(True))
            .all()
        )
        # Preparar datos de alerta

        for cuidador in cuidadores:
            alert_data = AlertNotification(
                to=cuidador.email,
                patient_name=f"{obj.paciente.primer_nombre_paciente} {obj.paciente.primer_apellido_paciente}",
                alert_type="Alerta de medición",
                severity=obj.severidad_max,
                message=obj.resumen_alerta,
                date_time=obj.fecha_registro.strftime('%Y-%m-%d %H:%M'),
            )
            async def send_alert():
                try:
                    await email_service.send_alert_notification(alert_data)
                except Exception as e:
                    print(f"Error enviando alerta a cuidador {cuidador.email}: {str(e)}")
            try:
                asyncio.create_task(send_alert())
            except RuntimeError:
                try:
                    asyncio.run(send_alert())
                except Exception as e:
                    print(f"Error enviando alerta a cuidador {cuidador.email}: {str(e)}")

    return obj

def update(db: Session, id_medicion: int, data: MedicionUpdate):
    obj = get(db, id_medicion)
    if not obj:
        return None

    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)

    db.commit()
    db.refresh(obj)
    return obj

def delete(db: Session, id_medicion: int):
    obj = get(db, id_medicion)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

# ==== Gestión de alerta (claim / estado) ====
def tomar_alerta(db: Session, id_medicion: int, rut_medico: str) -> Medicion | None:
    obj = db.get(Medicion, id_medicion)
    if not obj:
        return None

    if not obj.tiene_alerta:
        raise ValueError("La medición no tiene alerta.")
    if obj.estado_alerta in ("resuelta", "ignorada"):
        raise ValueError(f"No se puede tomar; la alerta está {obj.estado_alerta}.")
    if obj.tomada_por and obj.tomada_por != rut_medico:
        raise ValueError("La alerta ya fue tomada por otro médico.")

    obj.estado_alerta = "en_proceso"
    obj.tomada_por = rut_medico
    obj.tomada_en = datetime.now(timezone.utc)

    db.commit()
    db.refresh(obj)
    return obj

def cambiar_estado_alerta(db: Session, id_medicion: int, nuevo_estado: str) -> Medicion | None:
    obj = db.get(Medicion, id_medicion)
    if not obj:
        return None

    if nuevo_estado not in ("resuelta", "ignorada"):
        raise ValueError("Estado inválido.")
    if not obj.tiene_alerta:
        raise ValueError("La medición no tiene alerta.")

    now = datetime.now(timezone.utc)
    obj.estado_alerta = nuevo_estado

    if nuevo_estado == "resuelta":
        obj.resuelta_en = now
        obj.ignorada_en = None
    else:
        obj.ignorada_en = now
        obj.resuelta_en = None

    db.commit()
    db.refresh(obj)
    return obj

def list_alertas_por_cuidador(
    db: Session,
    rut_cuidador: str,
    solo_vigentes: bool = True,
    skip: int = 0,
    limit: int = 100,
):
    q = (
        db.query(Medicion)
        .join(PacienteCuidador, Medicion.rut_paciente == PacienteCuidador.rut_paciente)
        .filter(PacienteCuidador.rut_cuidador == rut_cuidador)
    )

    if solo_vigentes:
        q = q.filter(PacienteCuidador.activo == True)

    q = q.filter(Medicion.tiene_alerta == True)

    total = q.count()
    items = (
        q.order_by(Medicion.fecha_registro.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return items, total
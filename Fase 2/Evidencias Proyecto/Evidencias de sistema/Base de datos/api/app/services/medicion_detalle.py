from sqlalchemy.orm import Session
from datetime import datetime
from app.models import MedicionDetalle, RangoPaciente, Medicion
from app.schemas.medicion_detalle import MedicionDetalleCreate, MedicionDetalleUpdate
from app.services import notificaciones


def list_(db: Session, skip: int, limit: int, id_medicion: int | None = None, id_parametro: int | None = None):
    q = db.query(MedicionDetalle)
    if id_medicion is not None:
        q = q.filter(MedicionDetalle.id_medicion == id_medicion)
    if id_parametro is not None:
        q = q.filter(MedicionDetalle.id_parametro == id_parametro)
    total = q.count()
    items = q.order_by(MedicionDetalle.id_detalle).offset(skip).limit(limit).all()
    return items, total

def get(db: Session, id_detalle: int):
    return db.get(MedicionDetalle, id_detalle)

def create(db: Session, data: MedicionDetalleCreate):
    # Crear objeto base
    obj = MedicionDetalle(**data.model_dump())

    # Buscar la medición asociada (para obtener el rut del paciente)
    medicion = db.query(Medicion).filter(Medicion.id_medicion == data.id_medicion).first()
    if not medicion:
        raise ValueError("No se encontró la medición asociada")

    # Buscar rango configurado del paciente para este parámetro
    rango = (
        db.query(RangoPaciente)
        .filter(
            RangoPaciente.rut_paciente == medicion.rut_paciente,
            RangoPaciente.id_parametro == data.id_parametro
        )
        .first()
    )

    # Evaluar si el valor está fuera de rango
    if rango and data.valor_num is not None:
        if data.valor_num < rango.min_normal or data.valor_num > rango.max_normal:
            obj.fuera_rango = True

            # Calcular severidad según desviación
            diferencia = abs(data.valor_num - (rango.max_normal if data.valor_num > rango.max_normal else rango.min_normal))
            rango_total = rango.max_normal - rango.min_normal

            if diferencia > rango_total * 0.5:
                obj.severidad = "critica"
            elif diferencia > rango_total * 0.25:
                obj.severidad = "moderada"
            else:
                obj.severidad = "leve"

            obj.tipo_alerta = f"{rango.id_parametro}_FUERA_RANGO"

            # Crear notificación automática
            titulo = f"Alerta {obj.severidad.capitalize()} en {rango.id_parametro}"
            mensaje = (
                f"El paciente {medicion.rut_paciente} registró un valor fuera de rango "
                f"({data.valor_num})."
                f"Rango esperado: {rango.min_normal}-{rango.max_normal}."
            )

            notificaciones.crear_notificacion(
                db=db,
                rut_paciente=medicion.rut_paciente,
                tipo="alerta_fuera_rango",
                severidad=obj.severidad,
                titulo=titulo,
                mensaje=mensaje
            )
        else:
            obj.fuera_rango = False
            obj.severidad = "ninguna"
            obj.tipo_alerta = "OK"
    else:
        obj.fuera_rango = False
        obj.severidad = "ninguna"
        obj.tipo_alerta = "SIN_RANGO"

    # Guardar el detalle
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update(db: Session, id_detalle: int, data: MedicionDetalleUpdate):
    obj = get(db, id_detalle)
    if not obj: return None
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id_detalle: int):
    obj = get(db, id_detalle)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

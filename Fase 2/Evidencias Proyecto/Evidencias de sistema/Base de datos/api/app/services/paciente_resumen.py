from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import (
    Paciente, NotaClinica, RangoPaciente, ParametroClinico,
    Medicion, MedicionDetalle, UnidadMedida
)

def get_resumen(db: Session, rut: int):
    p = db.query(Paciente).filter(Paciente.rut_paciente == rut).first()
    if not p:
        return None

    edad = (datetime.now(timezone.utc) - p.fecha_nacimiento).days // 365

    ultima_nota = (
        db.query(NotaClinica)
        .filter(NotaClinica.rut_paciente == rut)
        .order_by(desc(NotaClinica.creada_en))
        .first()
    )

    return {
        "rut_paciente": p.rut_paciente,
        "nombre_completo": f"{p.primer_nombre_paciente} {p.segundo_nombre_paciente} {p.primer_apellido_paciente} {p.segundo_apellido_paciente}",
        "edad": edad,
        "enfermedad_principal": p.enfermedades,
        "ultima_atencion": ultima_nota.creada_en if ultima_nota else None,
    }

def get_metricas(db: Session, rut: int):
    rangos = (
        db.query(RangoPaciente)
        .join(ParametroClinico)
        .join(UnidadMedida, ParametroClinico.id_unidad == UnidadMedida.id_unidad)
        .filter(RangoPaciente.rut_paciente == rut)
        .all()
    )

    metricas = []
    for r in rangos:
        ultimo_detalle = (
            db.query(MedicionDetalle)
            .join(Medicion, MedicionDetalle.id_medicion == Medicion.id_medicion)
            .filter(
                Medicion.rut_paciente == rut,
                MedicionDetalle.id_parametro == r.id_parametro
            )
            .order_by(desc(Medicion.fecha_registro))
            .first()
        )

        metricas.append({
            "id_rango": r.id_rango,
            "id_parametro": r.id_parametro,
            "nombre": r.parametro.descipcion,
            "unidad": r.parametro.unidad.codigo,
            "rango_min": float(r.min_normal),
            "rango_max": float(r.max_normal),
            "valor_actual": float(ultimo_detalle.valor_num) if ultimo_detalle else None,
        })

    return metricas

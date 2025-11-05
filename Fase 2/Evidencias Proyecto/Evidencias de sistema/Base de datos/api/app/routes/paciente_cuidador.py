from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.common import Page
from app.schemas.paciente_cuidador import PacienteCuidadorCreate, PacienteCuidadorUpdate, PacienteCuidadorOut
from app.services import paciente_cuidador as svc

from datetime import date, datetime
from sqlalchemy import func, text
from app.models import Paciente, PacienteCuidador, Notificacion, Medicion


router = APIRouter(prefix="/paciente-cuidador", tags=["paciente_cuidador"])

@router.get("", response_model=Page[PacienteCuidadorOut])
def list_pc(page: int = 1, page_size: int = 20,
            rut_paciente: int | None = Query(None),
            rut_cuidador: int | None = Query(None),
            activo: bool | None = Query(None),
            db: Session = Depends(get_db)):
    items, total = svc.list_(db, skip=(page-1)*page_size, limit=page_size,
                            rut_paciente=rut_paciente, rut_cuidador=rut_cuidador, activo=activo)
    return Page(items=items, total=total, page=page, page_size=page_size)


@router.get("/resumen/{rut_cuidador}")
def resumen_pacientes_por_cuidador(rut_cuidador: int, db: Session = Depends(get_db)):

    relaciones = (
        db.query(PacienteCuidador)
        .filter(
            PacienteCuidador.rut_cuidador == rut_cuidador,
            PacienteCuidador.activo == True
        )
        .all()
    )

    if not relaciones:
        raise HTTPException(status_code=404, detail="No hay pacientes asignados a este cuidador")

    resultados = []

    for rel in relaciones:
        paciente = db.query(Paciente).filter_by(rut_paciente=rel.rut_paciente).first()
        if not paciente:
            continue

        # Calcular edad
        edad = None
        if paciente.fecha_nacimiento:
            hoy = date.today()
            edad = hoy.year - paciente.fecha_nacimiento.year - (
                (hoy.month, hoy.day) < (paciente.fecha_nacimiento.month, paciente.fecha_nacimiento.day)
            )

        # Última medición 
        ultima_medicion = (
            db.query(func.max(Medicion.fecha_registro))
            .filter(Medicion.rut_paciente == paciente.rut_paciente)
            .scalar()
        )

        # Contar alertas recientes (últimos 7 días)
        alertas = (
            db.query(func.count(Notificacion.id_notificacion))
            .filter(
                Notificacion.rut_paciente == paciente.rut_paciente,
                Notificacion.severidad.in_(["moderada", "critica"]),
                Notificacion.creada_en >= func.now() - text("INTERVAL '7 days'")
            )
            .scalar()
        )

        # Estado general
        if alertas == 0:
            estado = "stable"
        elif alertas == 1:
            estado = "attention_needed"
        else:
            estado = "critical"

        # Placeholder de próxima cita
        proxima_cita = "2025-11-10"

        resultados.append({
            "rut_paciente": paciente.rut_paciente,
            "nombre_completo": f"{paciente.primer_nombre_paciente} {paciente.primer_apellido_paciente}",
            "edad": edad,
            "enfermedad_principal": paciente.enfermedades,
            "ultima_actualizacion": (
                ultima_medicion.isoformat() if ultima_medicion else None
            ),
            "alertas": alertas or 0,
            "estado": estado,
            "proxima_cita": proxima_cita
        })

    return resultados

@router.get("/{rut_paciente}/{rut_cuidador}", response_model=PacienteCuidadorOut)
def get_pc(rut_paciente: int, rut_cuidador: int, db: Session = Depends(get_db)):
    obj = svc.get(db, rut_paciente, rut_cuidador)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("", response_model=PacienteCuidadorOut, status_code=status.HTTP_201_CREATED)
def create_pc(payload: PacienteCuidadorCreate, db: Session = Depends(get_db)):
    return svc.create(db, payload)

@router.patch("/{rut_paciente}/{rut_cuidador}", response_model=PacienteCuidadorOut)
def update_pc(rut_paciente: int, rut_cuidador: int, payload: PacienteCuidadorUpdate, db: Session = Depends(get_db)):
    obj = svc.update(db, rut_paciente, rut_cuidador, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{rut_paciente}/{rut_cuidador}")
def delete_pc(rut_paciente: int, rut_cuidador: int, db: Session = Depends(get_db)):
    ok = svc.delete(db, rut_paciente, rut_cuidador)
    if not ok: raise HTTPException(404, "Not found")
    return {"message": "Deleted"}



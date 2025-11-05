# test.py
from app.db import SessionLocal
from app.services.notificaciones import crear_notificacion

# Crear sesión de base de datos
db = SessionLocal()

# Ejecutar prueba de notificación
resultado = crear_notificacion(
    db,
    rut_paciente=11111111,  # usa un RUT existente en tu BD
    tipo="alerta_fuera_rango",
    severidad="critica",
    titulo="Presión arterial crítica",
    mensaje="El valor supera el umbral máximo establecido."
)

print("Notificación creada correctamente.")
print(resultado)


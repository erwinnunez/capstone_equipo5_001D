from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Dict, Any

from app.schemas.email import (
    EmailSchema,
    EmailResponse,
    WelcomeEmail,
    AppointmentReminder,
    AlertNotification,
    PasswordReset
)
from app.services.email import email_service

router = APIRouter(prefix="/email", tags=["email"])

@router.post("/send", response_model=Dict[str, Any])
async def send_basic_email(email_data: EmailSchema, background_tasks: BackgroundTasks):
    """Envía un email básico"""
    try:
        # Ejecutar en segundo plano para no bloquear la respuesta
        background_tasks.add_task(email_service.send_email, email_data)
        
        return {
            "success": True,
            "message": "Email programado para envío",
            "recipients": email_data.to
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error programando email: {str(e)}")

@router.post("/send-immediate", response_model=Dict[str, Any])
async def send_immediate_email(email_data: EmailSchema):
    """Envía un email inmediatamente (síncrono)"""
    result = await email_service.send_email(email_data)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    
    return result

@router.post("/welcome", response_model=Dict[str, Any])
async def send_welcome_email(welcome_data: WelcomeEmail, background_tasks: BackgroundTasks):
    """Envía email de bienvenida a nuevo paciente"""
    try:
        background_tasks.add_task(email_service.send_welcome_email, welcome_data)
        
        return {
            "success": True,
            "message": "Email de bienvenida programado para envío",
            "recipient": welcome_data.to
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error programando email de bienvenida: {str(e)}")

@router.post("/appointment-reminder", response_model=Dict[str, Any])
async def send_appointment_reminder(reminder_data: AppointmentReminder, background_tasks: BackgroundTasks):
    """Envía recordatorio de cita médica"""
    try:
        background_tasks.add_task(email_service.send_appointment_reminder, reminder_data)
        
        return {
            "success": True,
            "message": "Recordatorio de cita programado para envío",
            "recipient": reminder_data.to
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error programando recordatorio: {str(e)}")

@router.post("/alert", response_model=Dict[str, Any])
async def send_alert_notification(alert_data: AlertNotification):
    """Envía notificación de alerta médica (inmediato)"""
    result = await email_service.send_alert_notification(alert_data)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    
    return result

@router.post("/password-reset", response_model=Dict[str, Any])
async def send_password_reset(reset_data: PasswordReset):
    """Envía email de restablecimiento de contraseña (inmediato)"""
    result = await email_service.send_password_reset(reset_data)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    
    return result

@router.get("/test")
async def test_email_service():
    """Endpoint de prueba para verificar la configuración"""
    try:
        test_email = EmailSchema(
            to=["erwinenrique417@gmail.com"],
            subject="Test - Sistema CESFAM",
            body="Este es un email de prueba del sistema CESFAM.",
            html_body="<h1>Test Email</h1><p>Este es un email de prueba del sistema CESFAM.</p>"
        )
        
        result = await email_service.send_email(test_email)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en test de email: {str(e)}")

@router.get("/config")
async def get_email_config():
    """Obtiene la configuración de email (sin credenciales sensibles)"""
    return {
        "smtp_host": email_service.smtp_host,
        "smtp_port": email_service.smtp_port,
        "from_email": email_service.from_email,
        "from_name": email_service.from_name,
        "smtp_tls": email_service.smtp_tls
    }
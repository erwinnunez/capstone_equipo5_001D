from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict

class EmailSchema(BaseModel):
    """Schema para envío básico de email"""
    to: List[EmailStr]
    subject: str
    body: str
    html_body: Optional[str] = None
    
class EmailNotification(BaseModel):
    """Schema para notificaciones del sistema"""
    to: EmailStr
    template: str  # Nombre del template
    context: Dict[str, Any] = {}  # Variables para el template
    
class EmailResponse(BaseModel):
    """Schema de respuesta del envío de email"""
    success: bool
    message: str
    email_id: Optional[str] = None

# Templates predefinidos
class WelcomeEmail(BaseModel):
    """Template de bienvenida para pacientes"""
    to: EmailStr
    patient_name: str
    rut: str
    temporary_password: str

class AppointmentReminder(BaseModel):
    """Template de recordatorio de cita"""
    to: EmailStr
    patient_name: str
    appointment_date: str
    appointment_time: str
    doctor_name: str
    cesfam_name: str

class AlertNotification(BaseModel):
    """Template de alerta médica"""
    to: EmailStr
    patient_name: str
    alert_type: str
    severity: str
    message: str
    date_time: str

class PasswordReset(BaseModel):
    """Template de restablecimiento de contraseña"""
    to: EmailStr
    user_name: str
    reset_token: str
    expiry_time: str
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import aiosmtplib
from jinja2 import Template
from typing import List, Optional, Dict, Any
import logging
from pathlib import Path

from app.config import settings
from app.schemas.email import (
    EmailSchema, 
    EmailNotification, 
    WelcomeEmail, 
    AppointmentReminder, 
    AlertNotification, 
    PasswordReset
)

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_tls = settings.SMTP_TLS
        self.from_email = settings.EMAILS_FROM_EMAIL
        self.from_name = settings.EMAILS_FROM_NAME

    async def send_email(self, email_data: EmailSchema) -> Dict[str, Any]:
        """Envía un email básico"""
        try:
            # Crear mensaje
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = ", ".join(email_data.to)
            message["Subject"] = email_data.subject

            # Agregar texto plano
            text_part = MIMEText(email_data.body, "plain", "utf-8")
            message.attach(text_part)

            # Agregar HTML si está disponible
            if email_data.html_body:
                html_part = MIMEText(email_data.html_body, "html", "utf-8")
                message.attach(html_part)

            # Enviar email usando aiosmtplib con configuración correcta para Gmail
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True,
                use_tls=False  # No usar TLS directo, solo STARTTLS
            )

            logger.info(f"Email enviado exitosamente a: {', '.join(email_data.to)}")
            return {
                "success": True,
                "message": "Email enviado exitosamente",
                "recipients": email_data.to
            }

        except Exception as e:
            logger.error(f"Error enviando email: {str(e)}")
            return {
                "success": False,
                "message": f"Error enviando email: {str(e)}",
                "recipients": email_data.to
            }

    async def send_welcome_email(self, welcome_data: WelcomeEmail) -> Dict[str, Any]:
        """Envía email de bienvenida a nuevo paciente"""
        
        html_template = """
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2c5282; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f7fafc; padding: 30px; }
                    .credentials { background-color: #e2e8f0; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                    .button { background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido al Sistema de CuidaSalud!</h1>
                    </div>
                    <div class="content">
                        <h2>Hola {{ patient_name }}</h2>
                        <p>Te damos la bienvenida a nuestro sistema de salud digital. Tu cuenta ha sido creada exitosamente.</p>
                        
                        <div class="credentials">
                            <h3>Datos de acceso:</h3>
                            <p><strong>Email:</strong> {{ user_email }}</p>
                            <p><strong>Contraseña temporal:</strong> {{ temporary_password }}</p>
                        </div>
                        
                        <p><strong>Importante:</strong> Por tu seguridad, te recomendamos cambiar tu contraseña temporal en tu primer inicio de sesión.</p>
                        
                        <a href="#" class="button">Iniciar Sesión</a>
                        
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    </div>
                    <div class="footer">
                        <p>Sistema de Salud CESFAM<br>
                        Este es un email automático, por favor no responder.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        ¡Bienvenido al Sistema CuidaSalud!
        
        Hola {welcome_data.patient_name},
        
        Tu cuenta ha sido creada exitosamente.
        
        Datos de acceso:
        Email: {welcome_data.to}
        Contraseña temporal: {welcome_data.temporary_password}
        
        Por tu seguridad, te recomendamos cambiar tu contraseña temporal en tu primer inicio de sesión.
        
        Sistema de Salud CESFAM
        """
        
        template = Template(html_template)
        html_content = template.render(
            patient_name=welcome_data.patient_name,
            user_email=welcome_data.to,
            temporary_password=welcome_data.temporary_password
        )
        
        email_data = EmailSchema(
            to=[welcome_data.to],
            subject="Bienvenido al Sistema CuidaSalud - Credenciales de Acceso",
            body=text_content,
            html_body=html_content
        )
        
        return await self.send_email(email_data)

    async def send_appointment_reminder(self, reminder_data: AppointmentReminder) -> Dict[str, Any]:
        """Envía recordatorio de cita médica"""
        
        html_template = """
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #38a169; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f7fafc; padding: 30px; }
                    .appointment-details { background-color: #e6fffa; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #38a169; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Recordatorio de Cita Médica</h1>
                    </div>
                    <div class="content">
                        <h2>Hola {{ patient_name }}</h2>
                        <p>Te recordamos que tienes una cita médica programada:</p>
                        
                        <div class="appointment-details">
                            <h3>Detalles de la cita:</h3>
                            <p><strong>Fecha:</strong> {{ appointment_date }}</p>
                            <p><strong>Hora:</strong> {{ appointment_time }}</p>
                            <p><strong>Médico:</strong> {{ doctor_name }}</p>
                            <p><strong>Centro:</strong> {{ cesfam_name }}</p>
                        </div>
                        
                        <p><strong>Importante:</strong> Por favor llega 15 minutos antes de tu cita y trae tu carnet de identidad.</p>
                    </div>
                    <div class="footer">
                        <p>Sistema de Salud CESFAM<br>
                        Este es un email automático, por favor no responder.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        template = Template(html_template)
        html_content = template.render(
            patient_name=reminder_data.patient_name,
            appointment_date=reminder_data.appointment_date,
            appointment_time=reminder_data.appointment_time,
            doctor_name=reminder_data.doctor_name,
            cesfam_name=reminder_data.cesfam_name
        )
        
        text_content = f"""
        Recordatorio de Cita Médica
        
        Hola {reminder_data.patient_name},
        
        Te recordamos que tienes una cita médica programada:
        
        Fecha: {reminder_data.appointment_date}
        Hora: {reminder_data.appointment_time}
        Médico: {reminder_data.doctor_name}
        Centro: {reminder_data.cesfam_name}
        
        Por favor llega 15 minutos antes de tu cita y trae tu carnet de identidad.
        
        Sistema de Salud CESFAM
        """
        
        email_data = EmailSchema(
            to=[reminder_data.to],
            subject=f"Recordatorio: Cita médica {reminder_data.appointment_date}",
            body=text_content,
            html_body=html_content
        )
        
        return await self.send_email(email_data)

    async def send_alert_notification(self, alert_data: AlertNotification) -> Dict[str, Any]:
        """Envía notificación de alerta médica"""
        
        severity_colors = {
            "critical": "#e53e3e",
            "high": "#ed8936", 
            "medium": "#ecc94b",
            "low": "#48bb78"
        }
        
        color = severity_colors.get(alert_data.severity.lower(), "#718096")
        
        html_template = """
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: {{ color }}; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f7fafc; padding: 30px; }
                    .alert-details { background-color: #fed7d7; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid {{ color }}; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Alerta Médica</h1>
                    </div>
                    <div class="content">
                        <h2>Paciente: {{ patient_name }}</h2>
                        
                        <div class="alert-details">
                            <h3>Detalles de la alerta:</h3>
                            <p><strong>Tipo:</strong> {{ alert_type }}</p>
                            <p><strong>Severidad:</strong> {{ severity }}</p>
                            <p><strong>Fecha/Hora:</strong> {{ date_time }}</p>
                            <p><strong>Descripción:</strong> {{ message }}</p>
                        </div>
                        
                        <p><strong>Acción requerida:</strong> Esta alerta requiere atención médica. Por favor revisa el sistema para más detalles.</p>
                    </div>
                    <div class="footer">
                        <p>Sistema de Salud CESFAM<br>
                        Este es un email automático, por favor no responder.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        template = Template(html_template)
        html_content = template.render(
            patient_name=alert_data.patient_name,
            alert_type=alert_data.alert_type,
            severity=alert_data.severity.upper(),
            date_time=alert_data.date_time,
            message=alert_data.message,
            color=color
        )
        
        email_data = EmailSchema(
            to=[alert_data.to],
            subject=f"🚨 Alerta {alert_data.severity.upper()}: {alert_data.patient_name}",
            body=f"Alerta médica para {alert_data.patient_name}: {alert_data.message}",
            html_body=html_content
        )
        
        return await self.send_email(email_data)

    async def send_password_reset(self, reset_data: PasswordReset) -> Dict[str, Any]:
        """Envía email de restablecimiento de contraseña"""
        
        html_template = """
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #3182ce; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f7fafc; padding: 30px; }
                    .reset-details { background-color: #ebf8ff; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .button { background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Restablecimiento de Contraseña</h1>
                    </div>
                    <div class="content">
                        <h2>Hola {{ user_name }}</h2>
                        <p>Has solicitado restablecer tu contraseña. Usa el siguiente código para crear una nueva contraseña:</p>
                        
                        <div class="reset-details">
                            <h3>Código de restablecimiento:</h3>
                            <p style="font-size: 24px; font-weight: bold; text-align: center; color: #3182ce;">{{ reset_token }}</p>
                            <p><strong>Válido hasta:</strong> {{ expiry_time }}</p>
                        </div>
                        
                        <p><strong>Importante:</strong> Si no solicitaste este cambio, ignora este email.</p>
                        
                        <a href="#" class="button">Cambiar Contraseña</a>
                    </div>
                    <div class="footer">
                        <p>Sistema de Salud CESFAM<br>
                        Este es un email automático, por favor no responder.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        template = Template(html_template)
        html_content = template.render(
            user_name=reset_data.user_name,
            reset_token=reset_data.reset_token,
            expiry_time=reset_data.expiry_time
        )
        
        email_data = EmailSchema(
            to=[reset_data.to],
            subject="Restablecimiento de Contraseña - Sistema CuidaSalud",
            body=f"Código de restablecimiento: {reset_data.reset_token}. Válido hasta: {reset_data.expiry_time}",
            html_body=html_content
        )
        
        return await self.send_email(email_data)


# Instancia singleton del servicio
email_service = EmailService()
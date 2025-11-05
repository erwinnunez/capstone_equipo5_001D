import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.email_config import email_settings

def enviar_email(destinatario: str, asunto: str, cuerpo_html: str):
    """
    Envía un correo HTML simple usando Gmail SMTP.
    """
    msg = MIMEMultipart()
    msg["From"] = f"{email_settings.MAIL_FROM_NAME} <{email_settings.MAIL_FROM}>"
    msg["To"] = destinatario
    msg["Subject"] = asunto

    # Cuerpo HTML
    msg.attach(MIMEText(cuerpo_html, "html"))

    try:
        with smtplib.SMTP(email_settings.MAIL_SERVER, email_settings.MAIL_PORT) as server:
            if email_settings.MAIL_TLS:
                server.starttls()
            server.login(email_settings.MAIL_USERNAME, email_settings.MAIL_PASSWORD)
            server.send_message(msg)
            print(f"Correo enviado a {destinatario}")
            return True
    except Exception as e:
        print(f"Error al enviar correo a {destinatario}: {e}")
        return False

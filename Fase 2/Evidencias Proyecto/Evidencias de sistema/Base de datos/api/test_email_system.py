#!/usr/bin/env python3
"""
Script de diagnóstico para el sistema de correo
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.services.email import email_service
from app.schemas.email import EmailSchema, WelcomeEmail

async def test_email_config():
    """Prueba la configuración de email"""
    print("🔧 VERIFICACIÓN DE CONFIGURACIÓN")
    print("=" * 50)
    print(f"SMTP Host: {settings.SMTP_HOST}")
    print(f"SMTP Port: {settings.SMTP_PORT}")
    print(f"SMTP User: {settings.SMTP_USER}")
    print(f"SMTP Password: {'*' * len(settings.SMTP_PASSWORD) if settings.SMTP_PASSWORD else 'NO CONFIGURADA'}")
    print(f"From Email: {settings.EMAILS_FROM_EMAIL}")
    print(f"From Name: {settings.EMAILS_FROM_NAME}")
    print(f"TLS: {settings.SMTP_TLS}")
    print()

async def test_basic_email():
    """Prueba envío de email básico"""
    print("📧 PRUEBA DE EMAIL BÁSICO")
    print("=" * 50)
    
    try:
        email_data = EmailSchema(
            to=["erwinenrique417@gmail.com"],  # Enviar a ti mismo
            subject="🧪 Test - Sistema CESFAM",
            body="Este es un email de prueba básico.",
            html_body="<h1>🧪 Test Email</h1><p>Este es un email de prueba básico del sistema CESFAM.</p>"
        )
        
        print(f"Enviando email a: {email_data.to}")
        result = await email_service.send_email(email_data)
        
        if result["success"]:
            print("✅ Email básico enviado exitosamente")
        else:
            print(f"❌ Error en email básico: {result['message']}")
        
        return result["success"]
        
    except Exception as e:
        print(f"❌ Excepción en email básico: {str(e)}")
        return False

async def test_welcome_email():
    """Prueba envío de email de bienvenida"""
    print("\n👋 PRUEBA DE EMAIL DE BIENVENIDA")
    print("=" * 50)
    
    try:
        welcome_data = WelcomeEmail(
            to="erwinenrique417@gmail.com",  # Enviar a ti mismo
            patient_name="Juan Pérez Test",
            rut="12345678-9",
            temporary_password="test123"
        )
        
        print(f"Enviando email de bienvenida a: {welcome_data.to}")
        result = await email_service.send_welcome_email(welcome_data)
        
        if result["success"]:
            print("✅ Email de bienvenida enviado exitosamente")
        else:
            print(f"❌ Error en email de bienvenida: {result['message']}")
        
        return result["success"]
        
    except Exception as e:
        print(f"❌ Excepción en email de bienvenida: {str(e)}")
        return False

async def test_smtp_connection():
    """Prueba la conexión SMTP directamente"""
    print("\n🔌 PRUEBA DE CONEXIÓN SMTP")
    print("=" * 50)
    
    try:
        import aiosmtplib
        
        # Configurar SMTP para Gmail
        smtp = aiosmtplib.SMTP(
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            start_tls=True
        )
        
        # Conectar
        await smtp.connect()
        print("✅ Conexión SMTP establecida")
        
        # Login
        await smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        print("✅ Login SMTP exitoso")
        
        await smtp.quit()
        print("✅ Conexión cerrada correctamente")
        return True
        
    except Exception as e:
        print(f"❌ Error de conexión SMTP: {str(e)}")
        
        # Intentar método alternativo
        try:
            print("🔄 Intentando método alternativo...")
            smtp_alt = aiosmtplib.SMTP()
            await smtp_alt.connect(hostname=settings.SMTP_HOST, port=settings.SMTP_PORT)
            await smtp_alt.starttls()
            await smtp_alt.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            await smtp_alt.quit()
            print("✅ Conexión alternativa exitosa")
            return True
        except Exception as e2:
            print(f"❌ Error en método alternativo: {str(e2)}")
            return False

async def main():
    """Función principal de diagnóstico"""
    print("🚀 DIAGNÓSTICO DEL SISTEMA DE CORREO")
    print("=" * 50)
    
    # 1. Verificar configuración
    await test_email_config()
    
    # 2. Probar conexión SMTP
    smtp_ok = await test_smtp_connection()
    
    if not smtp_ok:
        print("\n❌ LA CONEXIÓN SMTP FALLÓ - Revisa las credenciales")
        return
    
    # 3. Probar email básico
    basic_ok = await test_basic_email()
    
    # 4. Probar email de bienvenida
    welcome_ok = await test_welcome_email()
    
    print("\n📊 RESUMEN DE PRUEBAS")
    print("=" * 50)
    print(f"SMTP Connection: {'✅' if smtp_ok else '❌'}")
    print(f"Email Básico: {'✅' if basic_ok else '❌'}")
    print(f"Email Bienvenida: {'✅' if welcome_ok else '❌'}")
    
    if basic_ok and welcome_ok:
        print("\n🎉 ¡SISTEMA DE EMAIL FUNCIONANDO CORRECTAMENTE!")
        print("Revisa tu bandeja de entrada en erwinenrique417@gmail.com")
    else:
        print("\n⚠️  PROBLEMAS DETECTADOS EN EL SISTEMA DE EMAIL")

if __name__ == "__main__":
    asyncio.run(main())
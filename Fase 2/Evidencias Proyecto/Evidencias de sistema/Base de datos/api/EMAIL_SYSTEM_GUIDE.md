<!-- # Sistema de Correo Electrónico - CESFAM

## 📧 Configuración 

### 🔒 Variables de Entorno (.env)

El sistema utiliza variables de entorno para mantener las credenciales seguras. 

**Agregar al archivo `.env`:**
```bash
# Email Configuration - Gmail SMTP
SMTP_USER=erwinenrique417@gmail.com
SMTP_PASSWORD=owdj lsja kark jchu
EMAILS_FROM_EMAIL=erwinenrique417@gmail.com
```

**Configuración automática:**
- **Servidor SMTP:** smtp.gmail.com:587
- **TLS:** Activado
- **Nombre del remitente:** Sistema de Salud CESFAM

### ⚠️ Importante para Gmail

Para usar Gmail necesitas:
1. **Activar 2FA** en tu cuenta de Gmail
2. **Generar una "Contraseña de aplicación"** en Configuración > Seguridad
3. **Usar la contraseña de aplicación** (no tu contraseña normal)

## 🚀 Endpoints Disponibles

### 1. Email Básico
```http
POST /email/send
```
**Body:**
```json
{
  "to": ["destinatario@ejemplo.com"],
  "subject": "Asunto del correo",
  "body": "Contenido en texto plano",
  "html_body": "<h1>Contenido HTML</h1>"
}
```

### 2. Email de Bienvenida
```http
POST /email/welcome
```
**Body:**
```json
{
  "to": "paciente@ejemplo.com",
  "patient_name": "Juan Pérez",
  "rut": "12345678-9",
  "temporary_password": "temp123"
}
```

### 3. Recordatorio de Cita
```http
POST /email/appointment-reminder
```
**Body:**
```json
{
  "to": "paciente@ejemplo.com",
  "patient_name": "Juan Pérez",
  "appointment_date": "2024-12-15",
  "appointment_time": "10:30",
  "doctor_name": "Dr. María González",
  "cesfam_name": "CESFAM Norte"
}
```

### 4. Alerta Médica
```http
POST /email/alert
```
**Body:**
```json
{
  "to": "medico@cesfam.com",
  "patient_name": "Juan Pérez",
  "alert_type": "Presión Arterial Alta",
  "severity": "critical",
  "message": "Presión arterial 180/110 mmHg",
  "date_time": "2024-11-08 14:30:00"
}
```

### 5. Restablecimiento de Contraseña
```http
POST /email/password-reset
```
**Body:**
```json
{
  "to": "usuario@ejemplo.com",
  "user_name": "Juan Pérez",
  "reset_token": "ABC123",
  "expiry_time": "2024-11-08 18:00:00"
}
```

### 6. Test de Configuración
```http
GET /email/test
```

## 💻 Llamadas desde el Frontend

### JavaScript/TypeScript (Fetch)

```typescript
// 1. Email básico
const sendBasicEmail = async () => {
  try {
    const response = await fetch('http://localhost:8000/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: ['destinatario@ejemplo.com'],
        subject: 'Prueba desde frontend',
        body: 'Este es un email de prueba',
        html_body: '<h2>Email de Prueba</h2><p>Enviado desde el frontend</p>'
      })
    });
    
    const result = await response.json();
    console.log('Email enviado:', result);
  } catch (error) {
    console.error('Error enviando email:', error);
  }
};

// 2. Email de bienvenida para nuevo paciente
const sendWelcomeEmail = async (patientData) => {
  try {
    const response = await fetch('http://localhost:8000/email/welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: patientData.email,
        patient_name: `${patientData.primer_nombre} ${patientData.primer_apellido}`,
        rut: patientData.rut_paciente,
        temporary_password: patientData.temporary_password
      })
    });
    
    const result = await response.json();
    console.log('Email de bienvenida enviado:', result);
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
  }
};

// 3. Recordatorio de cita
const sendAppointmentReminder = async (appointmentData) => {
  try {
    const response = await fetch('http://localhost:8000/email/appointment-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: appointmentData.patient_email,
        patient_name: appointmentData.patient_name,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        doctor_name: appointmentData.doctor_name,
        cesfam_name: appointmentData.cesfam_name
      })
    });
    
    const result = await response.json();
    console.log('Recordatorio enviado:', result);
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
  }
};

// 4. Alerta médica (inmediata)
const sendMedicalAlert = async (alertData) => {
  try {
    const response = await fetch('http://localhost:8000/email/alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: alertData.doctor_email,
        patient_name: alertData.patient_name,
        alert_type: alertData.alert_type,
        severity: alertData.severity, // critical, high, medium, low
        message: alertData.message,
        date_time: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    console.log('Alerta enviada:', result);
  } catch (error) {
    console.error('Error enviando alerta:', error);
  }
};

// 5. Restablecimiento de contraseña
const sendPasswordReset = async (resetData) => {
  try {
    const response = await fetch('http://localhost:8000/email/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: resetData.email,
        user_name: resetData.user_name,
        reset_token: resetData.reset_token,
        expiry_time: resetData.expiry_time
      })
    });
    
    const result = await response.json();
    console.log('Email de restablecimiento enviado:', result);
  } catch (error) {
    console.error('Error enviando email de restablecimiento:', error);
  }
};
```

### React Hook Personalizado

```typescript
import { useState } from 'react';

export const useEmailService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (endpoint: string, data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/email/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    sendWelcomeEmail: (data) => sendEmail('welcome', data),
    sendAppointmentReminder: (data) => sendEmail('appointment-reminder', data),
    sendMedicalAlert: (data) => sendEmail('alert', data),
    sendPasswordReset: (data) => sendEmail('password-reset', data),
    sendBasicEmail: (data) => sendEmail('send', data),
  };
};
```

## 🔧 Instalación

Para que funcione correctamente, instala las dependencias:

```bash
pip install email-validator aiosmtplib jinja2
```

## ✅ Características del Sistema

1. **✉️ Templates HTML hermosos** con estilos CSS incluidos
2. **🚀 Envío asíncrono** para no bloquear la aplicación
3. **📱 Responsive design** en los emails
4. **🎨 Templates personalizados** para cada tipo de email
5. **⚡ Envío inmediato o en segundo plano** según la necesidad
6. **🔒 Configuración segura** con variables de entorno
7. **📊 Logs detallados** para debugging
8. **🧪 Endpoint de prueba** incluido

## 🎯 Próximos Pasos

1. **Reinicia el servidor** para que se carguen las nuevas rutas
2. **Prueba el endpoint** `/email/test` para verificar la configuración
3. **Integra en tu frontend** usando los ejemplos de arriba
4. **Personaliza los templates** según tus necesidades

¡El sistema está listo para usar! 🎉 -->
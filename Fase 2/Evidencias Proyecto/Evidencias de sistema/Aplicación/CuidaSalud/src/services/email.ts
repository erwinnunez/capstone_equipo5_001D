// src/services/email.ts
const API_HOST = import.meta.env.VITE_API_HOST ?? "http://127.0.0.1:8000";
const RUTA_EMAIL = `${API_HOST}/email`;

/* =========================================================
   INTERFACES
   ========================================================= */

export interface EmailBasico {
  to: string[];
  subject: string;
  body: string;
  html_body?: string;
}

export interface EmailBienvenida {
  to: string;
  patient_name: string;
  rut: string;
  temporary_password: string;
}

export interface RecordatorioCita {
  to: string;
  patient_name: string;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  cesfam_name: string;
}

export interface AlertaMedica {
  to: string;
  patient_name: string;
  alert_type: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  date_time: string;
}

export interface RestablecerPassword {
  to: string;
  user_name: string;
  reset_token: string;
  expiry_time: string;
}

export interface EmailGamificacion {
  to: string;
  patient_name: string;
  achievement_name: string;
  achievement_description: string;
  total_points: number;
  streak_days: number;
}

/* =========================================================
   FUNCIONES DE ENVÍO
   ========================================================= */

/**
 * Envía un email básico personalizado
 */
export async function enviarEmailBasico(emailData: EmailBasico): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📧 [enviarEmailBasico] Enviando email a:`, emailData.to);
    
    const response = await fetch(`${RUTA_EMAIL}/send-immediate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      console.error(`❌ [enviarEmailBasico] Error:`, errorMessage);
      return { success: false, error: errorMessage };
    }

    await response.json(); // Consumir la respuesta
    console.log(`✅ [enviarEmailBasico] Email enviado exitosamente`);
    
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [enviarEmailBasico] Error de conexión:`, errorMessage);
    return { 
      success: false, 
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}

/**
 * Envía email de bienvenida (en background)
 */
export async function enviarEmailBienvenida(welcomeData: EmailBienvenida): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🎯 [enviarEmailBienvenida] Enviando bienvenida a: ${welcomeData.to}`);
    
    const response = await fetch(`${RUTA_EMAIL}/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(welcomeData),
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      console.error(`❌ [enviarEmailBienvenida] Error:`, errorMessage);
      return { success: false, error: errorMessage };
    }

    await response.json(); // Consumir la respuesta
    console.log(`✅ [enviarEmailBienvenida] Email de bienvenida programado`);
    
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [enviarEmailBienvenida] Error de conexión:`, errorMessage);
    return { 
      success: false, 
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}

/**
 * Envía recordatorio de cita (en background)
 */
export async function enviarRecordatorioCita(reminderData: RecordatorioCita): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📅 [enviarRecordatorioCita] Enviando recordatorio a: ${reminderData.to}`);
    
    const response = await fetch(`${RUTA_EMAIL}/appointment-reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(reminderData),
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      return { success: false, error: errorMessage };
    }

    console.log(`✅ [enviarRecordatorioCita] Recordatorio programado`);
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [enviarRecordatorioCita] Error de conexión:`, errorMessage);
    return { 
      success: false, 
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}

/**
 * Envía alerta médica (inmediato)
 */
export async function enviarAlertaMedica(alertData: AlertaMedica): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🚨 [enviarAlertaMedica] Enviando alerta ${alertData.severity} a: ${alertData.to}`);
    
    const response = await fetch(`${RUTA_EMAIL}/alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(alertData),
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      return { success: false, error: errorMessage };
    }

    console.log(`✅ [enviarAlertaMedica] Alerta enviada exitosamente`);
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [enviarAlertaMedica] Error de conexión:`, errorMessage);
    return { 
      success: false, 
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}

/**
 * Envía email de restablecimiento de contraseña (inmediato)
 */
export async function enviarRestablecerPassword(resetData: RestablecerPassword): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔐 [enviarRestablecerPassword] Enviando código a: ${resetData.to}`);
    
    const response = await fetch(`${RUTA_EMAIL}/password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(resetData),
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      return { success: false, error: errorMessage };
    }

    console.log(`✅ [enviarRestablecerPassword] Email de restablecimiento enviado`);
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [enviarRestablecerPassword] Error de conexión:`, errorMessage);
    return { 
      success: false, 
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}

/**
 * Envía email personalizado de gamificación
 */
export async function enviarEmailGamificacion(gamificationData: EmailGamificacion): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🏆 [enviarEmailGamificacion] Enviando felicitación de logro a: ${gamificationData.to}`);
    
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .achievement { background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
            .stats { display: flex; justify-content: space-around; background-color: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #1976d2; }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Felicitaciones ${gamificationData.patient_name}!</h1>
              <p>Has desbloqueado un nuevo logro</p>
            </div>
            <div class="content">
              <div class="achievement">
                <h2>🏆 ${gamificationData.achievement_name}</h2>
                <p>${gamificationData.achievement_description}</p>
              </div>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">${gamificationData.total_points}</div>
                  <div>Puntos totales</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${gamificationData.streak_days}</div>
                  <div>Días de racha</div>
                </div>
              </div>
              
              <p>¡Sigue así! Cada medición te acerca más a tus metas de salud.</p>
            </div>
            <div class="footer">
              <p>Sistema de Salud CESFAM<br>
              Este es un email automático, por favor no responder.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const textContent = `
      ¡Felicitaciones ${gamificationData.patient_name}!
      
      Has desbloqueado un nuevo logro: ${gamificationData.achievement_name}
      ${gamificationData.achievement_description}
      
      Estadísticas actuales:
      - Puntos totales: ${gamificationData.total_points}
      - Días de racha: ${gamificationData.streak_days}
      
      ¡Sigue así! Cada medición te acerca más a tus metas de salud.
      
      Sistema de Salud CESFAM
    `;
    
    const emailData: EmailBasico = {
      to: [gamificationData.to],
      subject: `🏆 ¡Nuevo logro desbloqueado: ${gamificationData.achievement_name}!`,
      body: textContent,
      html_body: htmlContent
    };
    
    return await enviarEmailBasico(emailData);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [enviarEmailGamificacion] Error:`, errorMessage);
    return { 
      success: false, 
      error: `Error enviando email de gamificación: ${errorMessage}` 
    };
  }
}

/**
 * Prueba la configuración de email
 */
export async function probarEmail(emailDestino: string = "erwinenrique417@gmail.com"): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🧪 [probarEmail] Enviando email de prueba a: ${emailDestino}`);
    
    const response = await fetch(`${RUTA_EMAIL}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.detail || errorData?.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usar el mensaje HTTP
      }
      
      return { success: false, error: errorMessage };
    }

    console.log(`✅ [probarEmail] Email de prueba enviado exitosamente`);
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`❌ [probarEmail] Error de conexión:`, errorMessage);
    return { 
      success: false, 
      error: `Error de conexión: ${errorMessage}` 
    };
  }
}
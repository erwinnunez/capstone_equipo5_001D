// src/services/validacionMediciones.ts
// Sistema de validación de rangos para mediciones vitales

export interface RangoValidacion {
  min_posible: number;
  max_posible: number;
  min_normal: number;
  max_normal: number;
  min_critico: number;
  max_critico: number;
  unidad: string;
  nombre: string;
  emoji: string;
}

export interface ErrorValidacion {
  campo: string;
  valor: number;
  mensaje: string;
  tipo: 'fuera_rango_posible' | 'critico' | 'warning';
  rango: RangoValidacion;
}

/**
 * Rangos de validación médica según especificaciones del usuario
 */
export const RANGOS_MEDICOS: Record<string, RangoValidacion> = {
  GLUCOSA: {
    min_posible: 20,      // Mínimo posible (compatible con vida)
    max_posible: 800,     // Máximo posible (registrable en humanos)
    min_normal: 70,       // Rango normal mínimo
    max_normal: 140,      // Rango normal máximo 
    min_critico: 40,      // Por debajo requiere atención inmediata 
    max_critico: 250,     // Por encima requiere atención inmediata
    unidad: 'mg/dL',
    nombre: 'Glucosa',
    emoji: '🩸'
  },
  
  PRESION_SISTOLICA: {
    min_posible: 60,      // Mínimo posible
    max_posible: 250,     // Máximo posible
    min_normal: 90,       // Rango normal mínimo
    max_normal: 140,      // Rango normal máximo
    min_critico: 80,      // Por debajo es peligroso (corregido para lógica)
    max_critico: 200,     // Por encima es peligroso
    unidad: 'mmHg',
    nombre: 'Presión Sistólica',
    emoji: '❤️'
  },
  
  PRESION_DIASTOLICA: {
    min_posible: 30,      // Mínimo posible
    max_posible: 150,     // Máximo posible
    min_normal: 60,       // Rango normal mínimo
    max_normal: 90,       // Rango normal máximo
    min_critico: 50,      // Por debajo indica emergencia (ajustado para lógica)
    max_critico: 120,     // Por encima indica emergencia
    unidad: 'mmHg',
    nombre: 'Presión Diastólica',
    emoji: '💙'
  },
  
  SATURACION_OXIGENO: {
    min_posible: 0,       // Mínimo posible (detectable)
    max_posible: 100,     // Máximo posible
    min_normal: 95,       // Rango normal mínimo
    max_normal: 100,      // Rango normal máximo
    min_critico: 90,      // Por debajo indica hipoxia (ajustado para lógica)
    max_critico: 100,     // No hay máximo crítico real
    unidad: '%',
    nombre: 'Saturación de Oxígeno',
    emoji: '🌬️'
  },
  
  TEMPERATURA: {
    min_posible: 25,      // Mínimo posible (compatible con vida)
    max_posible: 45,      // Máximo posible
    min_normal: 36,       // Rango normal mínimo
    max_normal: 37.7,     // Rango normal máximo
    min_critico: 35.5,    // Hipotermia severa (ajustado para lógica)
    max_critico: 41,      // Hipertermia grave
    unidad: '°C',
    nombre: 'Temperatura Corporal',
    emoji: '🌡️'
  }
};

/**
 * Valida un valor contra los rangos médicos establecidos
 * Solo bloquea valores fuera del rango posible, permite críticos y warnings
 */
export function validarMedicion(
  tipoParametro: keyof typeof RANGOS_MEDICOS,
  valor: number
): ErrorValidacion | null {
  const rango = RANGOS_MEDICOS[tipoParametro];
  
  if (!rango) {
    throw new Error(`Tipo de parámetro no reconocido: ${tipoParametro}`);
  }

  // Solo verificar si está fuera del rango posible (bloquear envío)
  if (valor < rango.min_posible || valor > rango.max_posible) {
    return {
      campo: tipoParametro,
      valor,
      mensaje: `${rango.emoji} ${rango.nombre}: Ingrese un valor entre ${rango.min_posible} y ${rango.max_posible} ${rango.unidad}`,
      tipo: 'fuera_rango_posible',
      rango
    };
  }

  // Valor dentro del rango posible - permitir registro sin errores
  return null;
}

/**
 * Valida un valor usando rangos personalizados del paciente si están disponibles
 * Solo bloquea valores fuera del rango posible, permite críticos y warnings
 */
export function validarMedicionConRangosPersonalizados(
  tipoParametro: keyof typeof RANGOS_MEDICOS,
  valor: number,
  rangosPersonalizados?: {
    normMin?: number;
    normMax?: number;
    critMin?: number;
    critMax?: number;
  }
): ErrorValidacion | null {
  const rangoBase = RANGOS_MEDICOS[tipoParametro];
  
  if (!rangoBase) {
    throw new Error(`Tipo de parámetro no reconocido: ${tipoParametro}`);
  }

  // Usar rangos personalizados si están disponibles, sino usar los defaults
  const rangoFinal: RangoValidacion = {
    ...rangoBase,
    min_normal: rangosPersonalizados?.normMin ?? rangoBase.min_normal,
    max_normal: rangosPersonalizados?.normMax ?? rangoBase.max_normal,
    min_critico: rangosPersonalizados?.critMin ?? rangoBase.min_critico,
    max_critico: rangosPersonalizados?.critMax ?? rangoBase.max_critico,
  };

  // Solo verificar si está fuera del rango posible (bloquear envío)
  if (valor < rangoFinal.min_posible || valor > rangoFinal.max_posible) {
    return {
      campo: tipoParametro,
      valor,
      mensaje: `${rangoFinal.emoji} ${rangoFinal.nombre}: Ingrese un valor entre ${rangoFinal.min_posible} y ${rangoFinal.max_posible} ${rangoFinal.unidad}`,
      tipo: 'fuera_rango_posible',
      rango: rangoFinal
    };
  }

  // Valor dentro del rango posible - permitir registro sin errores
  return null;
}

/**
 * Valida todas las mediciones de un conjunto de datos
 */
export function validarTodasLasMediciones(mediciones: {
  glucosa?: number;
  presionSistolica?: number;
  presionDiastolica?: number;
  saturacionOxigeno?: number;
  temperatura?: number;
}): ErrorValidacion[] {
  const errores: ErrorValidacion[] = [];

  if (mediciones.glucosa !== undefined) {
    const error = validarMedicion('GLUCOSA', mediciones.glucosa);
    if (error) errores.push(error);
  }

  if (mediciones.presionSistolica !== undefined) {
    const error = validarMedicion('PRESION_SISTOLICA', mediciones.presionSistolica);
    if (error) errores.push(error);
  }

  if (mediciones.presionDiastolica !== undefined) {
    const error = validarMedicion('PRESION_DIASTOLICA', mediciones.presionDiastolica);
    if (error) errores.push(error);
  }

  if (mediciones.saturacionOxigeno !== undefined) {
    const error = validarMedicion('SATURACION_OXIGENO', mediciones.saturacionOxigeno);
    if (error) errores.push(error);
  }

  if (mediciones.temperatura !== undefined) {
    const error = validarMedicion('TEMPERATURA', mediciones.temperatura);
    if (error) errores.push(error);
  }

  return errores;
}

/**
 * Determina si los errores bloquean el guardado
 */
export function erroresBloqueanGuardado(errores: ErrorValidacion[]): boolean {
  return errores.some(error => error.tipo === 'fuera_rango_posible');
}

/**
 * Genera un resumen de errores para mostrar al usuario
 * Solo procesa errores de valores fuera del rango posible
 */
export function generarResumenErrores(errores: ErrorValidacion[]): {
  titulo: string;
  mensaje: string;
  puedeGuardar: boolean;
  tipoAlerta: 'error' | 'warning';
} {
  if (errores.length === 0) {
    return {
      titulo: 'Mediciones Válidas',
      mensaje: 'Todas las mediciones están dentro de rangos aceptables.',
      puedeGuardar: true,
      tipoAlerta: 'warning'
    };
  }

  // Solo considerar errores de valores fuera del rango posible
  const erroresCriticos = errores.filter(e => e.tipo === 'fuera_rango_posible');

  if (erroresCriticos.length > 0) {
    return {
      titulo: '❌ Valores Imposibles',
      mensaje: `Se encontraron ${erroresCriticos.length} valor(es) fuera del rango posible que deben corregirse antes de guardar:\n\n${erroresCriticos.map(e => e.mensaje).join('\n\n')}\n\nEstos valores no pueden ser guardados porque son imposibles o erróneos.`,
      puedeGuardar: false,
      tipoAlerta: 'error'
    };
  }

  // Si no hay errores críticos, permitir guardar
  return {
    titulo: 'Mediciones Válidas',
    mensaje: 'Todas las mediciones están dentro de rangos aceptables.',
    puedeGuardar: true,
    tipoAlerta: 'warning'
  };
}
// utils/rut.ts
export function limpiarRut(raw: string): string {
  return (raw || "").toUpperCase().replace(/[^0-9K]/g, "");
}

export function calcularDV(cuerpoNum: string): "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "K" {
  let suma = 0;
  let factor = 2;
  for (let i = cuerpoNum.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpoNum[i], 10) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto) as any;
}

export function validarRutChile(raw: string): boolean {
  const limpio = limpiarRut(raw);
  if (limpio.length < 2) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;
  return calcularDV(cuerpo) === dv;
}

export function formatearRut(raw: string): string {
  const limpio = limpiarRut(raw);
  if (!limpio) return "";
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  // puntos cada 3 desde el final
  let cuerpoConPuntos = "";
  let cont = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    cuerpoConPuntos = cuerpo[i] + cuerpoConPuntos;
    cont++;
    if (cont === 3 && i !== 0) {
      cuerpoConPuntos = "." + cuerpoConPuntos;
      cont = 0;
    }
  }
  return `${cuerpoConPuntos}-${dv}`;
}

/**
 * Convierte un RUT válido a entero para BD:
 * - quita formato
 * - DV 'K' -> 0
 * - concatena cuerpo + dvNum
 * Ej: "12.345.678-K" => 123456780
 */
export function rutToNumericForDB(raw: string): number {
  const limpio = limpiarRut(raw);
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const dvNum = dv === "K" ? "0" : dv;
  return Number(cuerpo + dvNum);
}

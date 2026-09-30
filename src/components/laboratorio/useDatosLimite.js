import { useMemo } from 'react';
import { analizarLimite, compilar } from './mathUtils';

/** Separación entre fila y fila de la tabla de aproximación. */
export const PASOS_DEFECTO = [0.1, 0.01, 0.001, 0.0001];

/**
 * Datos compartidos por la tabla de aproximación y las gráficas de límites:
 * filas evaluadas a ambos lados del punto, límite calculado con la misma
 * rutina del laboratorio, puntos para la gráfica y laterales (h = 1e-6).
 */
export function useDatosLimite(expr, punto, pasos = PASOS_DEFECTO) {
  const filas = useMemo(() => {
    let evaluar;
    try {
      evaluar = compilar(expr);
    } catch {
      return [];
    }
    return pasos.map((h) => ({
      h,
      izqX: punto - h,
      izqY: evaluar(punto - h),
      derX: punto + h,
      derY: evaluar(punto + h),
    }));
  }, [expr, punto, pasos]);

  // El límite no es el valor de la última fila (8.0001), sino aquel al que ambos
  // lados se acercan: se calcula con la misma rutina que usa el laboratorio.
  const limite = useMemo(() => {
    try {
      return analizarLimite(compilar(expr), punto).valor ?? null;
    } catch {
      return null;
    }
  }, [expr, punto]);

  // Cada fila aporta dos puntos a la gráfica: el de la izquierda y el de la derecha.
  const puntosGrafica = useMemo(
    () => filas.flatMap((f) => [
      { x: f.izqX, y: f.izqY, lado: 'izq' },
      { x: f.derX, y: f.derY, lado: 'der' },
    ]).filter((p) => p.y !== null),
    [filas],
  );

  const laterales = useMemo(() => {
    try {
      const evaluar = compilar(expr);
      const h = 1e-6;
      return { izq: evaluar(punto - h), der: evaluar(punto + h) };
    } catch {
      return { izq: null, der: null };
    }
  }, [expr, punto]);

  const coinciden = laterales.izq !== null && laterales.der !== null
    && Math.abs(laterales.izq - laterales.der) < 1e-4;

  // Valor exacto en el punto, o null si la función no está definida ahí.
  // La gráfica lo necesita para no dibujar un hueco donde sí hay valor:
  // en (16-x²)/(4-x) con x=4 no existe, pero en f(x)=5 con x=2 vale 5.
  const valorEnPunto = useMemo(() => {
    try {
      const y = compilar(expr)(punto);
      return Number.isFinite(y) ? y : null;
    } catch {
      return null;
    }
  }, [expr, punto]);

  return { filas, limite, puntosGrafica, laterales, coinciden, valorEnPunto };
}

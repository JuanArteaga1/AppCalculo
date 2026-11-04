import { useEffect, useRef } from 'react';

/** Conecta el teclado matemático con un input controlado, respetando el cursor. */
export default function useCursorTeclado(valor, onValor) {
  const inputRef = useRef(null);
  const cursorPendiente = useRef(null);

  // El valor lo controla la página: hay que recolocar el cursor DESPUÉS de que
  // React haya pintado el nuevo texto, si no el cursor salta al final.
  useEffect(() => {
    const posicion = cursorPendiente.current;
    if (posicion === null || !inputRef.current) return;
    cursorPendiente.current = null;
    inputRef.current.focus();
    inputRef.current.setSelectionRange(posicion, posicion);
  });

  const insertar = (texto, retroceder = 0) => {
    const input = inputRef.current;
    const inicio = input?.selectionStart ?? valor.length;
    const fin = input?.selectionEnd ?? valor.length;
    const nuevo = valor.slice(0, inicio) + texto + valor.slice(fin);
    cursorPendiente.current = inicio + texto.length - retroceder;
    onValor(nuevo);
  };

  const borrar = () => {
    const input = inputRef.current;
    const inicio = input?.selectionStart ?? valor.length;
    const fin = input?.selectionEnd ?? valor.length;
    if (inicio !== fin) {
      cursorPendiente.current = inicio;
      onValor(valor.slice(0, inicio) + valor.slice(fin));
      return;
    }
    if (inicio === 0) return;
    cursorPendiente.current = inicio - 1;
    onValor(valor.slice(0, inicio - 1) + valor.slice(inicio));
  };

  /** Mueve el cursor un carácter a izquierda (-1) o derecha (+1). */
  const mover = (direccion) => {
    const input = inputRef.current;
    if (!input) return;
    const actual = input.selectionStart ?? valor.length;
    const destino = Math.min(Math.max(actual + direccion, 0), valor.length);
    input.focus();
    input.setSelectionRange(destino, destino);
  };

  return { inputRef, insertar, borrar, mover };
}

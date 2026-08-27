import { useEffect, useMemo, useRef } from 'react';
import { aTex, normalizarExpresion } from './mathUtils';
import MathKeyboard from './MathKeyboard';
import Tex from './Tex';

/**
 * Campo de entrada de funciones con vista previa en notación matemática
 * y teclado propio. Al presionar Enter (o "Graficar") se envía la función.
 */
export default function EntradaFuncion({
  valor,
  onValor,
  onEnviar,
  error,
  nombre = 'f_{1}',
  editando = false,
  onCancelarEdicion,
}) {
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

  const vistaPrevia = useMemo(() => {
    const expr = normalizarExpresion(valor);
    if (!expr) return null;
    return aTex(expr);
  }, [valor]);

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

  const enviar = () => onEnviar(valor);

  return (
    <div className="lab-entrada">
      <div className="lab-entrada-fila">
        <span className="lab-entrada-nombre">
          <Tex tex={`${nombre}(x)=`} />
        </span>
        <input
          ref={inputRef}
          className="lab-entrada-input"
          value={valor}
          onChange={(e) => onValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              enviar();
            }
            if (e.key === 'Escape' && editando) onCancelarEdicion?.();
          }}
          placeholder="x^2 - 4"
          spellCheck="false"
          autoComplete="off"
          autoCapitalize="off"
          aria-label="Expresión de la función"
        />
        <button
          type="button"
          className="lab-entrada-btn-enviar"
          onClick={enviar}
          title={editando ? 'Guardar cambios' : 'Graficar'}
        >
          {editando ? '✓ Guardar' : 'Graficar ↵'}
        </button>
      </div>

      {/* Renglón de altura fija: la gráfica no se mueve mientras escribes. */}
      <div className={`lab-entrada-estado ${error ? 'con-error' : ''}`}>
        {error
          ? error
          : vistaPrevia
            ? <Tex tex={`${nombre}(x) = ${vistaPrevia}`} />
            : <span className="lab-entrada-pista">Escribe la ecuación y presiona Enter para graficarla</span>}
      </div>

      {editando && (
        <button type="button" className="lab-entrada-cancelar" onClick={onCancelarEdicion}>
          Cancelar edición
        </button>
      )}

      <MathKeyboard
        onInsertar={insertar}
        onBorrar={borrar}
        onLimpiar={() => onValor('')}
        onMover={mover}
        onGraficar={enviar}
      />
    </div>
  );
}

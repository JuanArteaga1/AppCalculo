import { useMemo } from 'react';
import { aTex, normalizarExpresion } from './mathUtils';
import MathKeyboard from './MathKeyboard';
import Tex from './Tex';
import useCursorTeclado from './useCursorTeclado';

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
  const { inputRef, insertar, borrar, mover } = useCursorTeclado(valor, onValor);

  const vistaPrevia = useMemo(() => {
    const expr = normalizarExpresion(valor);
    if (!expr) return null;
    return aTex(expr);
  }, [valor]);

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
